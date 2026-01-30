// PURPOSE: Component tests for KPICard
// Tests rendering, interactions, and accessibility
// Nielsen #1: Visibility of system status through loading states

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KPICard } from '@/components/KPICard';

describe('KPICard', () => {
  const defaultProps = {
    title: 'Active Employees',
    numericValue: 42,
  };

  it('should render title and numeric value', () => {
    render(<KPICard {...defaultProps} />);

    expect(screen.getByText('Active Employees')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render subtext when provided', () => {
    render(<KPICard {...defaultProps} subtext="vs. yesterday" />);

    expect(screen.getByText('vs. yesterday')).toBeInTheDocument();
  });

  it('should show loading skeleton when isLoading is true', () => {
    render(<KPICard {...defaultProps} isLoading />);

    // Should not show the actual value when loading
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });

  it('should be clickable when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<KPICard {...defaultProps} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not be clickable when onClick is not provided', () => {
    render(<KPICard {...defaultProps} />);

    // Should render as article, not button
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('should format number values correctly', () => {
    render(<KPICard {...defaultProps} numericValue={1234567} format="number" />);

    // Should format with commas or appropriate formatting
    expect(screen.getByText(/1,?234,?567/)).toBeInTheDocument();
  });

  it('should format percentage values correctly', () => {
    render(<KPICard {...defaultProps} numericValue={95.5} format="percentage" />);

    expect(screen.getByText(/95\.5%/)).toBeInTheDocument();
  });

  it('should format hours values correctly', () => {
    render(<KPICard {...defaultProps} numericValue={8.5} format="hours" />);

    expect(screen.getByText(/8\.5/)).toBeInTheDocument();
  });

  it('should show upward trend indicator', () => {
    render(
      <KPICard
        {...defaultProps}
        trend={{ direction: 'up', percentage: 12, comparedTo: 'yesterday' }}
      />
    );

    expect(screen.getByText(/12%/)).toBeInTheDocument();
  });

  it('should show downward trend indicator', () => {
    render(
      <KPICard
        {...defaultProps}
        trend={{ direction: 'down', percentage: 5, comparedTo: 'yesterday' }}
      />
    );

    expect(screen.getByText(/5%/)).toBeInTheDocument();
  });

  it('should have appropriate ARIA label for accessibility', () => {
    render(<KPICard {...defaultProps} onClick={() => {}} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Active Employees'));
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('42'));
  });

  it('should respond to keyboard navigation when clickable', () => {
    const handleClick = jest.fn();
    render(<KPICard {...defaultProps} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalled();
  });
});
