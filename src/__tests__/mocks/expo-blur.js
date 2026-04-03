/**
 * Mock for expo-blur
 */

const React = require('react');

const MockBlurView = ({ intensity, style, children }) => {
  return React.createElement('BlurView', { intensity, style }, children);
};

module.exports = {
  BlurView: MockBlurView,
  default: MockBlurView,
};
