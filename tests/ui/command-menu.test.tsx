import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommandMenu from '../../app/components/CommandMenu';

describe('CommandMenu', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders the toggle button correctly', () => {
    render(<CommandMenu />);
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  test('opens menu when toggle is clicked', () => {
    render(<CommandMenu />);
    const toggle = screen.getByLabelText('Open menu');

    fireEvent.click(toggle);

    // Check if menu shows up
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('shows "Add Icon" text when menu is opened', async () => {
    render(<CommandMenu />);

    // Click the toggle to open the menu
    const toggle = screen.getByLabelText('Open menu');
    fireEvent.click(toggle);

    // Wait for menu to be visible and check for "Add Icon" text
    await waitFor(() => {
      expect(screen.getByText(/Add Icon/i)).toBeInTheDocument();
    });
  });

  test('closes menu when close button is clicked', async () => {
    render(<CommandMenu />);

    const toggle = screen.getByLabelText('Open menu');
    fireEvent.click(toggle);

    // Expected menu to be open initially
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Find and click the close button
    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('closes menu with ESC key', () => {
    render(<CommandMenu />);

    const toggle = screen.getByLabelText('Open menu');
    fireEvent.click(toggle);

    // Expect menu to be open initially
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Fire keydown event on document simulating press of Escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    // The menu should now be closed immediately
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('executes placeholder action when "Add Icon" clicked', () => {
    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<CommandMenu />);

    // Open the menu
    const toggle = screen.getByLabelText('Open menu');
    fireEvent.click(toggle);

    // Find and click "Add Icon" button
    const addIconButton = screen.getByText(/Add Icon/i);
    fireEvent.click(addIconButton);

    // Verify console.log was called with the expected message
    expect(consoleSpy).toHaveBeenCalledWith('Add Icon clicked');

    // Restore console
    consoleSpy.mockRestore();
  });
});
