import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import FeedbackForm, { FeedbackFormProps } from './FeedbackForm';

// Create a mock function that can be reconfigured in each test
const mockUseChrome = jest.fn();

// Mock the useChrome hook
jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => mockUseChrome(),
}));

const defaultProps: FeedbackFormProps = {
  onBack: jest.fn(),
  onSubmit: jest.fn(),
  onError: jest.fn(),
  modalTitle: 'Test Modal',
  feedbackType: 'Feedback',
  checkboxDescription: 'Test checkbox description',
  submitTitle: 'Submit',
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(<IntlProvider locale="en">{component}</IntlProvider>);
};

describe('FeedbackForm - Environment Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows submission in production environment', () => {
    mockUseChrome.mockReturnValue({
      getEnvironment: () => 'prod',
      auth: {
        getUser: jest.fn(),
        getToken: jest.fn(),
      },
    });

    renderWithIntl(<FeedbackForm {...defaultProps} />);

    // The warning label should NOT be present when submission is available
    expect(
      screen.queryByText(/Feedback can only be submitted in prod and stage/)
    ).not.toBeInTheDocument();
  });

  it('allows submission in stage environment', () => {
    mockUseChrome.mockReturnValue({
      getEnvironment: () => 'stage',
      auth: {
        getUser: jest.fn(),
        getToken: jest.fn(),
      },
    });

    renderWithIntl(<FeedbackForm {...defaultProps} />);

    // The warning label should NOT be present when submission is available
    expect(
      screen.queryByText(/Feedback can only be submitted in prod and stage/)
    ).not.toBeInTheDocument();
  });

  it('allows submission in frhStage (federal stage) environment', () => {
    mockUseChrome.mockReturnValue({
      getEnvironment: () => 'frhStage',
      auth: {
        getUser: jest.fn(),
        getToken: jest.fn(),
      },
    });

    renderWithIntl(<FeedbackForm {...defaultProps} />);

    // The warning label should NOT be present when submission is available
    expect(
      screen.queryByText(/Feedback can only be submitted in prod and stage/)
    ).not.toBeInTheDocument();
  });

  it('blocks submission in QA environment', () => {
    mockUseChrome.mockReturnValue({
      getEnvironment: () => 'qa',
      auth: {
        getUser: jest.fn(),
        getToken: jest.fn(),
      },
    });

    renderWithIntl(<FeedbackForm {...defaultProps} />);

    // The warning label SHOULD be present when submission is not available
    expect(
      screen.getByText(/Feedback can only be submitted in prod and stage/)
    ).toBeInTheDocument();
  });

  it('blocks submission in CI environment', () => {
    mockUseChrome.mockReturnValue({
      getEnvironment: () => 'ci',
      auth: {
        getUser: jest.fn(),
        getToken: jest.fn(),
      },
    });

    renderWithIntl(<FeedbackForm {...defaultProps} />);

    // The warning label SHOULD be present when submission is not available
    expect(
      screen.getByText(/Feedback can only be submitted in prod and stage/)
    ).toBeInTheDocument();
  });

  it('blocks submission in unknown/local environments', () => {
    mockUseChrome.mockReturnValue({
      getEnvironment: () => 'ephemeral',
      auth: {
        getUser: jest.fn(),
        getToken: jest.fn(),
      },
    });

    renderWithIntl(<FeedbackForm {...defaultProps} />);

    // The warning label SHOULD be present when submission is not available
    expect(
      screen.getByText(/Feedback can only be submitted in prod and stage/)
    ).toBeInTheDocument();
  });
});
