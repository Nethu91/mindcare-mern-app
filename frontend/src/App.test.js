import { render, screen, fireEvent } from "@testing-library/react";
import NotificationBell from "./components/NotificationBell";
import API from "./api/axios";
let mockPath = "/dashboard";
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({useLocation: () => ({pathname: mockPath}), useNavigate: () => mockNavigate}), {virtual: true});
jest.mock("./api/axios", () => ({get: jest.fn()}));
afterEach(() => { localStorage.clear(); jest.clearAllMocks(); });
test("dashboard uses its existing header bell without a duplicate", () => {
  localStorage.setItem("token", "test"); mockPath = "/dashboard";
  render(<NotificationBell />);
  expect(screen.queryByRole("button", { name: /Open notifications/ })).not.toBeInTheDocument();
});
test("journal bell loads unread count and opens inbox", async () => {
  localStorage.setItem("token", "test"); mockPath = "/journal";
  API.get.mockResolvedValue({data: [{read: false}, {read: true}]});
  render(<NotificationBell />);
  const bell = await screen.findByRole("button", {name: "Open notifications, 1 unread"});
  fireEvent.click(bell);
  expect(mockNavigate).toHaveBeenCalledWith("/notifications");
});
