export const getImageUrl = (path) => {
  if (!path || typeof path !== 'string') return "";
  
  // If it's already a full URL or base64 data, return it as is
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  // Get the base URL
  // In development, we use the absolute URL to avoid proxy issues with media files
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "https://collabration-teams.onrender.com";

  // Remove trailing slash from base URL
  const cleanBaseUrl = apiBaseUrl.replace(/\/$/, "");
  
  // Ensure path starts with slash
  let cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // If the path is relative and doesn't start with /media, add it
  // Many backends return paths relative to the media folder
  if (!cleanPath.startsWith("/media")) {
    cleanPath = `/media${cleanPath}`;
  }

  return `${cleanBaseUrl}${cleanPath}`;
};
