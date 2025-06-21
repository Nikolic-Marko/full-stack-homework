import React from 'react';
import { render, screen } from '@testing-library/react';
import TopNavigation from '@/app/components/TopNavigation';

// Mock the usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/numbers'),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('TopNavigation', () => {
  it('renders the navigation bar with title', () => {
    render(<TopNavigation />);
    
    // Check if title is rendered (use getAllByText since it appears in both nav and drawer)
    const titleElements = screen.getAllByText('Full Stack Assessment');
    expect(titleElements.length).toBeGreaterThan(0);
    expect(titleElements[0]).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<TopNavigation />);
    
    // Check if both navigation links are rendered
    // Use getAllByText and index since there are two instances (desktop and mobile menu)
    const numbersLinks = screen.getAllByText('Numbers');
    const gradesLinks = screen.getAllByText('Grades');
    
    expect(numbersLinks.length).toBeGreaterThan(0);
    expect(gradesLinks.length).toBeGreaterThan(0);
  });

  it('has proper navigation hrefs', () => {
    render(<TopNavigation />);
    
    // Find links by their href attributes
    const numbersLink = screen.getByRole('link', { name: 'Numbers' });
    const gradesLink = screen.getByRole('link', { name: 'Grades' });
    
    // Check that the links point to the correct routes
    expect(numbersLink).toHaveAttribute('href', '/numbers');
    expect(gradesLink).toHaveAttribute('href', '/grades');
  });
});
