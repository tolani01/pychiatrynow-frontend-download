import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the environment variable
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_BASE_URL: 'http://127.0.0.1:8000',
  },
  writable: true,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App', () => {
  it('renders without crashing', () => {
    renderWithRouter(<App />);
    expect(screen.getByText(/PsychNow/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithRouter(<App />);
    expect(screen.getByText(/Patient Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Provider Dashboard/i)).toBeInTheDocument();
  });

  it('navigates to patient portal', () => {
    renderWithRouter(<App />);
    const patientPortalLink = screen.getByText(/Patient Portal/i);
    patientPortalLink.click();
    expect(window.location.pathname).toBe('/patient-portal/dashboard');
  });

  it('navigates to provider dashboard', () => {
    renderWithRouter(<App />);
    const providerLink = screen.getByText(/Provider Dashboard/i);
    providerLink.click();
    expect(window.location.pathname).toBe('/provider/dashboard');
  });
});
