/**
 * PhotoGallery Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PhotoGallery from '../PhotoGallery';
import { Photo } from '../../types/photo';

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Dimensions: {
    get: jest.fn().mockReturnValue({ width: 375 }),
  },
}));

describe('PhotoGallery', () => {
  const mockOnAddPhoto = jest.fn();
  const mockOnRemovePhoto = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders "+" button when photos is empty', () => {
    const { getByText } = render(
      <PhotoGallery photos={[]} onAddPhoto={mockOnAddPhoto} />
    );

    expect(getByText('+')).toBeTruthy();
  });

  test('renders grid when photos are provided', () => {
    const photos: Photo[] = [
      { id: '1', file_url: 'file:///test1.jpg', plant_id: 'p1', user_id: 'u1' },
      { id: '2', file_url: 'file:///test2.jpg', plant_id: 'p2', user_id: 'u1' },
    ];

    const { getByTestId } = render(
      <PhotoGallery photos={photos} onAddPhoto={mockOnAddPhoto} testID="gallery" />
    );

    expect(getByTestId('gallery')).toBeTruthy();
  });

  test('calls onAddPhoto when "+" button is pressed', () => {
    const { getByText } = render(
      <PhotoGallery photos={[]} onAddPhoto={mockOnAddPhoto} />
    );

    fireEvent.press(getByText('+'));
    expect(mockOnAddPhoto).toHaveBeenCalled();
  });

  test('shows remove buttons when onRemovePhoto is provided', () => {
    const photos: Photo[] = [
      { id: '1', file_url: 'file:///test1.jpg', plant_id: 'p1', user_id: 'u1' },
    ];

    const { getAllByText } = render(
      <PhotoGallery
        photos={photos}
        onAddPhoto={mockOnAddPhoto}
        onRemovePhoto={mockOnRemovePhoto}
      />
    );

    const removeButtons = getAllByText('×');
    expect(removeButtons.length).toBe(1);
  });

  test('calls onRemovePhoto when remove button is pressed', () => {
    const photos: Photo[] = [
      { id: '1', file_url: 'file:///test1.jpg', plant_id: 'p1', user_id: 'u1' },
    ];

    const { getByText } = render(
      <PhotoGallery
        photos={photos}
        onAddPhoto={mockOnAddPhoto}
        onRemovePhoto={mockOnRemovePhoto}
      />
    );

    fireEvent.press(getByText('×'));
    expect(mockOnRemovePhoto).toHaveBeenCalledWith('1');
  });
});