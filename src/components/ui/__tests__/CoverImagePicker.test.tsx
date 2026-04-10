/**
 * CoverImagePicker Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CoverImagePicker from '../CoverImagePicker';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

describe('CoverImagePicker', () => {
  test('renders placeholder when no image provided', () => {
    const mockOnChange = jest.fn();
    const { getByText, getByLabelText } = render(
      <CoverImagePicker imageUrl={null} onChangeImage={mockOnChange} />
    );

    expect(getByText('Bild auswählen')).toBeTruthy();
    expect(getByText('Foto aufnehmen')).toBeTruthy();
  });

  test('renders with image and shows image + action buttons', () => {
    const mockOnChange = jest.fn();
    const { getByText, getByTestId } = render(
      <CoverImagePicker
        imageUrl="file:///test/image.jpg"
        onChangeImage={mockOnChange}
        testID="cover-picker"
      />
    );

    expect(getByText('Ändern')).toBeTruthy();
    expect(getByText('Entfernen')).toBeTruthy();
  });

  test('calls onChangeImage with null when remove is pressed', () => {
    const mockOnChange = jest.fn();
    const { getByText } = render(
      <CoverImagePicker
        imageUrl="file:///test/image.jpg"
        onChangeImage={mockOnChange}
      />
    );

    fireEvent.press(getByText('Entfernen'));
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  test('uses custom placeholder when provided', () => {
    const mockOnChange = jest.fn();
    const { getByText } = render(
      <CoverImagePicker
        imageUrl={null}
        onChangeImage={mockOnChange}
        placeholder="Eigenes Coverbild"
      />
    );

    expect(getByText('Eigenes Coverbild')).toBeTruthy();
  });
});