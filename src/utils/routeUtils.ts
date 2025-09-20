export const parseSharedRoute = (routeParam: string) => {
  try {
    return JSON.parse(decodeURIComponent(routeParam));
  } catch (error) {
    console.error('Failed to parse shared route:', error);
    return null;
  }
};

export const loadSharedRoute = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const routeParam = urlParams.get('route');
  
  if (routeParam) {
    return parseSharedRoute(routeParam);
  }
  
  return null;
};