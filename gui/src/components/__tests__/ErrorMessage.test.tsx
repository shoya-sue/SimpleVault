import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  test('renders the message', () => {
    render(<ErrorMessage message="テストメッセージ" />);
    expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
  });

  test('uses error styles by default', () => {
    const { container } = render(<ErrorMessage message="エラーメッセージ" />);
    const errorDiv = container.firstChild;
    expect(errorDiv).toHaveClass('bg-red-100');
    expect(errorDiv).toHaveClass('border-red-400');
    expect(errorDiv).toHaveClass('text-red-700');
  });

  test('applies different styles based on type prop', () => {
    const { container: warnContainer } = render(
      <ErrorMessage message="警告メッセージ" type="warning" />
    );
    expect(warnContainer.firstChild).toHaveClass('bg-yellow-100');

    const { container: infoContainer } = render(
      <ErrorMessage message="情報メッセージ" type="info" />
    );
    expect(infoContainer.firstChild).toHaveClass('bg-blue-100');

    const { container: successContainer } = render(
      <ErrorMessage message="成功メッセージ" type="success" />
    );
    expect(successContainer.firstChild).toHaveClass('bg-green-100');
  });

  test('calls onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();
    render(<ErrorMessage message="閉じるテスト" onClose={onCloseMock} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test('does not render close button when onClose is not provided', () => {
    render(<ErrorMessage message="閉じるボタンなし" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders nothing when message is empty', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  test('applies additional className when provided', () => {
    const { container } = render(
      <ErrorMessage message="追加クラス" className="test-class" />
    );
    expect(container.firstChild).toHaveClass('test-class');
  });
}); 