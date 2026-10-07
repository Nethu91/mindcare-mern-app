import { act, render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import Chatbot from "./Chatbot";
import API from "../api/axios";

jest.mock("../api/axios", () => ({ get: jest.fn(), post: jest.fn() }));
jest.mock("../components/BottomNav", () => () => <nav>Bottom navigation</nav>);
jest.mock("react-router-dom", () => ({ Link: ({ to, children }) => <a href={to}>{children}</a> }), { virtual: true });

beforeEach(() => {
  jest.clearAllMocks();
  Element.prototype.scrollTo = jest.fn();
  API.get.mockResolvedValue({ data: { name: "MindCare English intent model" } });
});

async function openChat() {
  const view = render(<Chatbot />);
  await screen.findByText("Support assistant connected");
  return view;
}

test("sends trimmed English input to the API and displays reply and safe feature links", async () => {
  API.post.mockResolvedValue({ data: { reply: "Let's find a small next step.", actions: [{ label: "Journal", path: "/journal" }, { label: "Bad link", path: "https://example.com" }] } });
  await openChat();
  expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  fireEvent.change(screen.getByRole("textbox", { name: "Your message" }), { target: { value: "  I feel stressed  " } });
  fireEvent.submit(screen.getByRole("button", { name: "Send message" }).closest("form"));
  expect(await screen.findByText("Let's find a small next step.")).toBeInTheDocument();
  expect(API.post).toHaveBeenCalledTimes(1);
  expect(API.post.mock.calls[0][0]).toBe("/chat");
  expect(API.post.mock.calls[0][1].message).toBe("I feel stressed");
  expect(API.post.mock.calls[0][1].history).toHaveLength(1);
  expect(screen.getByRole("link", { name: "Journal" })).toHaveAttribute("href", "/journal");
  expect(screen.queryByRole("link", { name: "Bad link" })).not.toBeInTheDocument();
  expect(screen.getByRole("textbox")).toHaveValue("");
});

test("suggestions send one request and block duplicate clicks while waiting", async () => {
  let resolve;
  API.post.mockImplementation(() => new Promise((done) => { resolve = done; }));
  await openChat();
  const suggestion = screen.getByRole("button", { name: "I feel anxious" });
  fireEvent.click(suggestion);
  fireEvent.click(suggestion);
  expect(API.post).toHaveBeenCalledTimes(1);
  expect(suggestion).toBeDisabled();
  expect(screen.getByRole("status", { name: "Assistant is replying" })).toBeInTheDocument();
  await act(async () => resolve({ data: { reply: "I'm here to listen.", actions: [] } }));
  expect(suggestion).not.toBeDisabled();
});

test("failed request offers retry without duplicating the user message or inventing a bot reply", async () => {
  API.post.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ data: { reply: "Thanks for waiting.", actions: [] } });
  await openChat();
  fireEvent.click(screen.getByRole("button", { name: "I feel sad" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("could not connect");
  expect(screen.getByRole("textbox")).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Retry message" }));
  expect(await screen.findByText("Thanks for waiting.")).toBeInTheDocument();
  expect(API.post.mock.calls[1][1]).toEqual(API.post.mock.calls[0][1]);
  expect(within(screen.getByRole("log")).getAllByText("I feel sad")).toHaveLength(1);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("expired session offers sign-in and urgent help remains accessible", async () => {
  API.post.mockRejectedValue({ response: { status: 401 } });
  await openChat();
  fireEvent.click(screen.getByRole("button", { name: "I feel stressed" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("session has expired");
  expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  expect(screen.getAllByRole("link", { name: "Emergency support" }).length).toBeGreaterThan(0);
});

test("clearing a pending chat aborts the request and ignores its eventual reply", async () => {
  let resolve;
  API.post.mockImplementation(() => new Promise((done) => { resolve = done; }));
  await openChat();
  fireEvent.click(screen.getByRole("button", { name: "I feel anxious" }));
  const signal = API.post.mock.calls[0][2].signal;
  fireEvent.click(screen.getByRole("button", { name: "New chat" }));
  expect(signal.aborted).toBe(true);
  await act(async () => resolve({ data: { reply: "Stale reply", actions: [] } }));
  expect(screen.queryByText("Stale reply")).not.toBeInTheDocument();
  expect(within(screen.getByRole("log")).queryByText("I feel anxious")).not.toBeInTheDocument();
});

test("follow-up payload includes conversation and urgent replies show Emergency link", async () => {
  API.post.mockResolvedValueOnce({ data: { reply: "Would you like a grounding activity?", actions: [] } })
    .mockResolvedValueOnce({ data: { reply: "Please seek immediate support.", urgent: true, actions: [{ label: "Open Emergency support", path: "/emergency" }] } });
  await openChat();
  fireEvent.click(screen.getByRole("button", { name: "I feel anxious" }));
  await screen.findByText("Would you like a grounding activity?");
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "yes" } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  expect(await screen.findByText("Please seek immediate support.")).toBeInTheDocument();
  expect(API.post.mock.calls[1][1].history).toEqual(expect.arrayContaining([{ sender: "user", text: "I feel anxious" }]));
  expect(screen.getByRole("link", { name: "Open Emergency support" })).toHaveAttribute("href", "/emergency");
  expect(screen.getByText("Please seek immediate support.").parentElement).toHaveAttribute("data-urgent", "true");
});

test("unmount aborts a pending chat request", async () => {
  API.post.mockImplementation(() => new Promise(() => {}));
  const view = await openChat();
  fireEvent.click(screen.getByRole("button", { name: "I feel stressed" }));
  const signal = API.post.mock.calls[0][2].signal;
  view.unmount();
  expect(signal.aborted).toBe(true);
});

test("unavailable model endpoint is shown without disabling emergency access", async () => {
  API.get.mockRejectedValue(new Error("offline"));
  render(<Chatbot />);
  await waitFor(() => expect(screen.getByText("Assistant unavailable")).toBeInTheDocument());
  expect(screen.getByRole("link", { name: "Emergency support" })).toHaveAttribute("href", "/emergency");
});

test("AI configuration and actual generated replies are distinguished from local fallback", async () => {
  API.get.mockResolvedValue({ data: { generation: { engine: "llm" } } });
  API.post.mockResolvedValueOnce({ data: { reply: "That meeting sounded difficult. What felt hardest?", engine: "llm", actions: [] } })
    .mockResolvedValueOnce({ data: { reply: "A basic support reply.", engine: "local", notice: "AI replies are temporarily unavailable. This reply uses basic local support.", actions: [] } });
  render(<Chatbot />);
  await screen.findByText("AI mode configured");
  expect(screen.getByText(/conversation context are sent to your configured AI provider/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "I feel stressed" }));
  await screen.findByText("AI assistant connected");
  fireEvent.click(screen.getByRole("button", { name: "I feel sad" }));
  await screen.findByText("Support assistant connected");
  expect(screen.getByText(/This reply uses basic local support/)).toBeInTheDocument();
});
