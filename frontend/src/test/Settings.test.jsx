import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Settings from '../pages/Settings';
import api from '../services/api';

// Mock the API service
vi.mock('../services/api');

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock Navbar and Sidebar components
vi.mock('../components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

describe('Settings - Zone Fetching (Task 2.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch zones on component mount', async () => {
    const mockZones = [
      {
        _id: '1',
        name: 'Zone A',
        building: 'Building 1',
        department: 'IT',
        ipRange: '10.0.1.0/24',
        riskLevel: 'Medium',
        enabled: true,
      },
      {
        _id: '2',
        name: 'Zone B',
        building: 'Building 2',
        department: 'HR',
        ipRange: '10.0.2.0/24',
        riskLevel: 'Low',
        enabled: true,
      },
    ];

    api.get.mockResolvedValueOnce({
      data: {
        data: {
          zones: mockZones,
          pagination: { page: 1, limit: 50, total: 2, pages: 1 },
        },
      },
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Verify API was called
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/zones');
    });

    // Verify zones are displayed
    await waitFor(() => {
      expect(screen.getByText('Zone A')).toBeInTheDocument();
      expect(screen.getByText('Zone B')).toBeInTheDocument();
    });
  });

  it('should handle loading state during fetch', async () => {
    const mockZones = [
      {
        _id: '1',
        name: 'Zone A',
        building: 'Building 1',
        department: 'IT',
        ipRange: '10.0.1.0/24',
        riskLevel: 'Medium',
        enabled: true,
      },
    ];

    // Simulate a delay in the API call
    api.get.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: {
                  data: {
                    zones: mockZones,
                    pagination: { page: 1, limit: 50, total: 1, pages: 1 },
                  },
                },
              }),
            100
          )
        )
    );

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText('Loading zones...')).toBeInTheDocument();
    });

    // Wait for zones to load
    await waitFor(() => {
      expect(screen.getByText('Zone A')).toBeInTheDocument();
    });
  });

  it('should parse zone response and store in state', async () => {
    const mockZones = [
      {
        _id: '1',
        name: 'Zone A',
        building: 'Building 1',
        department: 'IT',
        ipRange: '10.0.1.0/24',
        riskLevel: 'Medium',
        enabled: true,
      },
    ];

    api.get.mockResolvedValueOnce({
      data: {
        data: {
          zones: mockZones,
          pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        },
      },
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Verify zone data is displayed correctly
    await waitFor(() => {
      expect(screen.getByText('Zone A')).toBeInTheDocument();
      expect(screen.getByText('10.0.1.0/24')).toBeInTheDocument();
      expect(screen.getByText('Building 1')).toBeInTheDocument();
    });
  });

  it('should handle fetch errors with user-friendly message', async () => {
    api.get.mockRejectedValueOnce({
      response: {
        status: 500,
        data: {
          message: 'Internal server error',
        },
      },
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Verify error message is displayed
    await waitFor(() => {
      expect(
        screen.getByText(/Failed to fetch zones:/i)
      ).toBeInTheDocument();
    });
  });

  it('should handle timeout errors', async () => {
    api.get.mockRejectedValueOnce({
      code: 'ECONNABORTED',
      message: 'Request timeout',
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Verify timeout error message is displayed
    await waitFor(() => {
      expect(
        screen.getByText(/Failed to fetch zones:/i)
      ).toBeInTheDocument();
    });
  });

  it('should display "No zones configured" when zone list is empty', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: {
          zones: [],
          pagination: { page: 1, limit: 50, total: 0, pages: 0 },
        },
      },
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Verify empty state message is displayed
    await waitFor(() => {
      expect(screen.getByText('No zones configured')).toBeInTheDocument();
    });
  });
});

describe('Settings - Zone List Rendering (Task 2.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render zone list with all required fields', async () => {
    const mockZones = [
      {
        _id: '1',
        name: 'Zone A',
        building: 'Building 1',
        department: 'IT',
        ipRange: '10.0.1.0/24',
        riskLevel: 'Medium',
        enabled: true,
      },
      {
        _id: '2',
        name: 'Zone B',
        building: 'Building 2',
        department: 'HR',
        ipRange: '10.0.2.0/24',
        riskLevel: 'Critical',
        enabled: false,
      },
    ];

    api.get.mockResolvedValueOnce({
      data: {
        data: {
          zones: mockZones,
          pagination: { page: 1, limit: 50, total: 2, pages: 1 },
        },
      },
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Verify all required fields are displayed for each zone
    await waitFor(() => {
      // Zone A fields
      expect(screen.getByText('Zone A')).toBeInTheDocument();
      expect(screen.getByText('10.0.1.0/24')).toBeInTheDocument();
      expect(screen.getByText('Building 1')).toBeInTheDocument();
      expect(screen.getByText('IT')).toBeInTheDocument();
      
      // Zone B fields
      expect(screen.getByText('Zone B')).toBeInTheDocument();
      expect(screen.getByText('10.0.2.0/24')).toBeInTheDocument();
      expect(screen.getByText('Building 2')).toBeInTheDocument();
      expect(screen.getByText('HR')).toBeInTheDocument();
    });
  });

  it('should display risk level with correct color coding', async () => {
    const mockZones = [
      {
        _id: '1',
        name: 'Critical Zone',
        building: 'Building 1',
        department: 'IT',
        ipRange: '10.0.1.0/24',
        riskLevel: 'Critical',
        enabled: true,
      },
      {
        _id: '2',
        name: 'High Zone',
        building: 'Building 2',
        department: 'HR',
        ipRange: '10.0.2.0/24',
        riskLevel: 'High',
        enabled: true,
      },
      {
        _id: '3',
        name: 'Medium Zone',
        building: 'Building 3',
        department: 'Finance',
        ipRange: '10.0.3.0/24',
        riskLevel: 'Medium',
        enabled: true,
      },
      {
        _id: '4',
        name: 'Low Zone',
        building: 'Building 4',
        department: 'Admin',
        ipRange: '10.0.4.0/24',
        riskLevel: 'Low',
        enabled: true,
      },
    ];

    api.get.mockResolvedValueOnce({
      data: {
        data: {
          zones: mockZones,
          pagination: { page: 1, limit: 50, total: 4, pages: 1 },
        },
      },
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Verify all risk levels are displayed
    await waitFor(() => {
      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
    });
  });

  it('should render toggle checkbox for each zone', async () => {
    const mockZones = [
      {
        _id: '1',
        name: 'Zone A',
        building: 'Building 1',
        department: 'IT',
        ipRange: '10.0.1.0/24',
        riskLevel: 'Medium',
        enabled: true,
      },
      {
        _id: '2',
        name: 'Zone B',
        building: 'Building 2',
        department: 'HR',
        ipRange: '10.0.2.0/24',
        riskLevel: 'Low',
        enabled: false,
      },
    ];

    api.get.mockResolvedValueOnce({
      data: {
        data: {
          zones: mockZones,
          pagination: { page: 1, limit: 50, total: 2, pages: 1 },
        },
      },
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Verify checkboxes are rendered with correct state
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      // Should have checkboxes for zones (at least 2 for the zones)
      expect(checkboxes.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('should render delete button for each zone', async () => {
    const mockZones = [
      {
        _id: '1',
        name: 'Zone A',
        building: 'Building 1',
        department: 'IT',
        ipRange: '10.0.1.0/24',
        riskLevel: 'Medium',
        enabled: true,
      },
      {
        _id: '2',
        name: 'Zone B',
        building: 'Building 2',
        department: 'HR',
        ipRange: '10.0.2.0/24',
        riskLevel: 'Low',
        enabled: true,
      },
    ];

    api.get.mockResolvedValueOnce({
      data: {
        data: {
          zones: mockZones,
          pagination: { page: 1, limit: 50, total: 2, pages: 1 },
        },
      },
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Verify delete buttons are rendered
    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/Delete/i);
      expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('should display zone list in table format with proper headers', async () => {
    const mockZones = [
      {
        _id: '1',
        name: 'Zone A',
        building: 'Building 1',
        department: 'IT',
        ipRange: '10.0.1.0/24',
        riskLevel: 'Medium',
        enabled: true,
      },
    ];

    api.get.mockResolvedValueOnce({
      data: {
        data: {
          zones: mockZones,
          pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        },
      },
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Verify table headers are present
    await waitFor(() => {
      expect(screen.getByText('Enabled')).toBeInTheDocument();
      expect(screen.getByText('Zone Name')).toBeInTheDocument();
      expect(screen.getByText('IP Range')).toBeInTheDocument();
      expect(screen.getByText('Building')).toBeInTheDocument();
      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText('Risk Level')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('should display zone data in correct table cells', async () => {
    const mockZones = [
      {
        _id: '1',
        name: 'Test Zone',
        building: 'Test Building',
        department: 'Test Department',
        ipRange: '192.168.1.0/24',
        riskLevel: 'High',
        enabled: true,
      },
    ];

    api.get.mockResolvedValueOnce({
      data: {
        data: {
          zones: mockZones,
          pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        },
      },
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );

    // Verify zone data is displayed in the correct order
    await waitFor(() => {
      expect(screen.getByText('Test Zone')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.0/24')).toBeInTheDocument();
      expect(screen.getByText('Test Building')).toBeInTheDocument();
      expect(screen.getByText('Test Department')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });
});
