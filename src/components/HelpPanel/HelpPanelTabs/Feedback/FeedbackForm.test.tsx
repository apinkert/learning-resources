import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const mockUser = {
  identity: {
    account_number: '12345',
    user: {
      username: 'testuser',
      email: 'test@example.com',
    },
  },
};

const mockAuthChrome = (environment: string) => ({
  getEnvironment: () => environment,
  auth: {
    getUser: jest.fn().mockResolvedValue(mockUser),
    getToken: jest.fn().mockResolvedValue('mock-token'),
  },
});

describe('FeedbackForm - Environment Detection', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows submission in production environment', async () => {
    mockUseChrome.mockReturnValue(mockAuthChrome('prod'));
    const onSubmit = jest.fn();

    renderWithIntl(<FeedbackForm {...defaultProps} onSubmit={onSubmit} />);

    // Verify warning label is not present
    expect(
      screen.queryByText(/Feedback can only be submitted in prod and stage/)
    ).not.toBeInTheDocument();

    // Type feedback and submit
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Test feedback');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.click(submitButton);

    // Verify fetch was called with correct parameters
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/platform-feedback/v1/issues'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    // Verify onSubmit callback was called
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('allows submission in stage environment', async () => {
    mockUseChrome.mockReturnValue(mockAuthChrome('stage'));
    const onSubmit = jest.fn();

    renderWithIntl(<FeedbackForm {...defaultProps} onSubmit={onSubmit} />);

    // Verify warning label is not present
    expect(
      screen.queryByText(/Feedback can only be submitted in prod and stage/)
    ).not.toBeInTheDocument();

    // Type feedback and submit
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Test feedback');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.click(submitButton);

    // Verify fetch was called
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Verify onSubmit callback was called
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('allows submission in frhStage (federal stage) environment', async () => {
    mockUseChrome.mockReturnValue(mockAuthChrome('frhStage'));
    const onSubmit = jest.fn();

    renderWithIntl(<FeedbackForm {...defaultProps} onSubmit={onSubmit} />);

    // Verify warning label is not present
    expect(
      screen.queryByText(/Feedback can only be submitted in prod and stage/)
    ).not.toBeInTheDocument();

    // Type feedback and submit
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Test feedback');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.click(submitButton);

    // Verify fetch was called
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Verify onSubmit callback was called
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
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

  it('blocks submission when getEnvironment is not available', () => {
    mockUseChrome.mockReturnValue({
      // getEnvironment is missing
      auth: {
        getUser: jest.fn(),
        getToken: jest.fn(),
      },
    });

    renderWithIntl(<FeedbackForm {...defaultProps} />);

    // The warning label SHOULD be present when getEnvironment is unavailable
    expect(
      screen.getByText(/Feedback can only be submitted in prod and stage/)
    ).toBeInTheDocument();
  });
});
