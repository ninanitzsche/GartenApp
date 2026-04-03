/**
 * Mock for @expo/vector-icons
 */

const React = require('react');

const MockIcon = ({ name, size, color, ...props }) => {
  return React.createElement('View', { testID: `icon-${name}` }, null);
};

const MaterialIcons = MockIcon;
const Ionicons = MockIcon;
const FontAwesome = MockIcon;
const FontAwesome5 = MockIcon;
const Feather = MockIcon;
const AntDesign = MockIcon;
const Entypo = MockIcon;
const EvilIcons = MockIcon;
const Foundation = MockIcon;
const Octicons = MockIcon;
const SimpleLineIcons = MockIcon;
const Zocial = MockIcon;

module.exports = {
  MaterialIcons,
  Ionicons,
  FontAwesome,
  FontAwesome5,
  Feather,
  AntDesign,
  Entypo,
  EvilIcons,
  Foundation,
  Octicons,
  SimpleLineIcons,
  Zocial,
  createIconSet: jest.fn(() => MockIcon),
  createIconSetFromFontello: jest.fn(() => MockIcon),
  createMultiStyleIconSet: jest.fn(() => MockIcon),
  default: {
    MaterialIcons,
    Ionicons,
    FontAwesome,
    FontAwesome5,
    Feather,
    AntDesign,
    Entypo,
    EvilIcons,
    Foundation,
    Octicons,
    SimpleLineIcons,
    Zocial,
  },
};
