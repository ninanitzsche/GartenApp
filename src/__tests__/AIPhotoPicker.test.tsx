// @ts-nocheck
/**
 * AIPhotoPicker Tests
 */

import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AIPhotoPicker from '../components/AIPhotoPicker';

jest.mock('../services/aiService', () => ({
  pickImage: jest.fn(),
  identifyPlant: jest.fn(),
}));

jest.mock('../services/aiIntegrationService', () => ({
  analyzePhotoWithHealth: jest.fn(),
  compressImage: jest.fn(),
}));

jest.mock('../services/cacheService', () => ({
  cacheIdentification: jest.fn(),
  getCachedIdentification: jest.fn(),
}));

jest.mock('../services/plantService', () => ({
  fetchPlants: jest.fn(),
  createPlant: jest.fn(),
}));

jest.mock('../services/photoService', () => ({
  uploadPhoto: jest.fn(),
}));

jest.mock('../services/healthCheckService', () => ({
  createHealthCheck: jest.fn(),
}));

jest.mock('../services/taskSuggestionService', () => ({
  getAllSuggestions: jest.fn(),
}));

jest.mock('../components/TaskSuggestionModal', () => 'TaskSuggestionModal');
jest.mock('../components/AIPhotoStep2', () => 'AIPhotoStep2');
jest.mock('../components/AIPhotoStep3', () => 'AIPhotoStep3');
jest.mock('../components/AIPhotoStep4', () => 'AIPhotoStep4');

const { pickImage } = require('../services/aiService');
const { analyzePhotoWithHealth } = require('../services/aiIntegrationService');
const { fetchPlants, createPlant } = require('../services/plantService');
const { uploadPhoto } = require('../services/photoService');
const { createHealthCheck } = require('../services/healthCheckService');

describe('AIPhotoPicker', () => {
  const mockOnClose = jest.fn();
  const mockOnPlantIdentified = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (pickImage as jest.Mock).mockResolvedValue(null);
    (analyzePhotoWithHealth as jest.Mock).mockResolvedValue({
      plantIdentification: null,
      matchingPlants: [],
      bestMatch: null,
      healthStatus: null,
    });
    (fetchPlants as jest.Mock).mockResolvedValue([]);
  });

  it('should render Step 1 initially', () => {
    const { getByText } = render(
      <AIPhotoPicker
        visible={true}
        onClose={mockOnClose}
        onPlantIdentified={mockOnPlantIdentified}
      />
    );
    expect(getByText('Kamera')).toBeTruthy();
    expect(getByText('Galerie')).toBeTruthy();
    expect(getByText('Pflanze erkennen')).toBeTruthy();
  });

  it('should call pickImage with camera when camera button is pressed', async () => {
    (pickImage as jest.Mock).mockResolvedValue({ uri: 'file://test-image.jpg' });

    const { getByText } = render(
      <AIPhotoPicker
        visible={true}
        onClose={mockOnClose}
        onPlantIdentified={mockOnPlantIdentified}
      />
    );

    const cameraButton = getByText('Kamera');
    fireEvent.press(cameraButton);

    await waitFor(() => {
      expect(pickImage).toHaveBeenCalledWith('camera');
    });
  });

  it('should call pickImage with gallery when gallery button is pressed', async () => {
    (pickImage as jest.Mock).mockResolvedValue({ uri: 'file://test-image.jpg' });

    const { getByText } = render(
      <AIPhotoPicker
        visible={true}
        onClose={mockOnClose}
        onPlantIdentified={mockOnPlantIdentified}
      />
    );

    const galleryButton = getByText('Galerie');
    fireEvent.press(galleryButton);

    await waitFor(() => {
      expect(pickImage).toHaveBeenCalledWith('gallery');
    });
  });

  it('should display image preview after selection', async () => {
    (pickImage as jest.Mock).mockResolvedValue({ uri: 'file://test-image.jpg' });

    const { getByText } = render(
      <AIPhotoPicker
        visible={true}
        onClose={mockOnClose}
        onPlantIdentified={mockOnPlantIdentified}
      />
    );

    const galleryButton = getByText('Galerie');
    fireEvent.press(galleryButton);

    await waitFor(() => {
      expect(getByText('Pflanze erkennen')).toBeTruthy();
    });
  });

  it('should call analyzePhotoWithHealth when identify button is pressed', async () => {
    (pickImage as jest.Mock).mockResolvedValue({ uri: 'file://test-image.jpg' });
    (analyzePhotoWithHealth as jest.Mock).mockResolvedValue({
      plantIdentification: {
        name: 'Rose',
        scientificName: 'Rosa',
        confidence: 0.9,
        family: 'Rosaceae',
        commonNames: ['Rose'],
      },
      matchingPlants: [],
      bestMatch: null,
      healthStatus: null,
    });

    const { getByText } = render(
      <AIPhotoPicker
        visible={true}
        onClose={mockOnClose}
        onPlantIdentified={mockOnPlantIdentified}
      />
    );

    const galleryButton = getByText('Galerie');
    fireEvent.press(galleryButton);

    await waitFor(() => {
      expect(getByText('Pflanze erkennen')).toBeTruthy();
    });

    const identifyButton = getByText('Pflanze erkennen');
    fireEvent.press(identifyButton);

    await waitFor(() => {
      expect(analyzePhotoWithHealth).toHaveBeenCalledWith('file://test-image.jpg', []);
    });
  });

  it('should reset state and call onClose when closed', () => {
    (pickImage as jest.Mock).mockResolvedValue({ uri: 'file://test-image.jpg' });
    (analyzePhotoWithHealth as jest.Mock).mockResolvedValue({
      plantIdentification: {
        name: 'Rose',
        scientificName: 'Rosa',
        confidence: 0.9,
        family: 'Rosaceae',
        commonNames: ['Rose'],
      },
      matchingPlants: [],
      bestMatch: null,
      healthStatus: null,
    });

    const { getByText, UNSAFE_getAllByType } = render(
      <AIPhotoPicker
        visible={true}
        onClose={mockOnClose}
        onPlantIdentified={mockOnPlantIdentified}
      />
    );

    const galleryButton = getByText('Galerie');
    fireEvent.press(galleryButton);

    const closeButtons = UNSAFE_getAllByType('TouchableOpacity');
    fireEvent.press(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalled();
  });
});