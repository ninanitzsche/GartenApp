import { renderHook } from '@testing-library/react-native';
import { useGilden } from '../useGilden';

describe('useGilden', () => {
  it('should be defined', () => {
    const { result } = renderHook(() => useGilden());
    expect(result.current).toBeDefined();
  });

  it('should have gilden array', () => {
    const { result } = renderHook(() => useGilden());
    expect(result.current.gilden).toBeInstanceOf(Array);
  });

  it('should have fetchGilden function', () => {
    const { result } = renderHook(() => useGilden());
    expect(typeof result.current.fetchGilden).toBe('function');
  });

  it('should have getBeetGilden function', () => {
    const { result } = renderHook(() => useGilden());
    expect(typeof result.current.getBeetGilden).toBe('function');
  });
});