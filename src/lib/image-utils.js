const getApiBaseUrl = () =>
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/backend" : "https://collabration-teams.onrender.com");

const normalizeImagePath = (path) => {
  if (!path || typeof path !== "string") return "";

  const value = path.trim();

  if (!value) return "";
  return value;
};

const encodePathSegments = (path) =>
  path
    .split("/")
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");

export const getImageUrl = (path) => {
  const value = normalizeImagePath(path);

  if (!value) return "";

  if (
    value.startsWith("http") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("//")) {
    return `${window.location.protocol}${value}`;
  }

  const cleanBaseUrl = getApiBaseUrl().replace(/\/$/, "");
  let cleanPath = value.startsWith("/") ? value : `/${value}`;

  if (cleanPath.startsWith("/backend/")) {
    return cleanPath;
  }

  const publicRoots = ["/media", "/uploads", "/static", "/storage", "/assets", "/files"];
  const hasPublicRoot = publicRoots.some((root) => cleanPath.startsWith(root));
  const mediaRelativeRoots = ["/profiles", "/profile-images", "/profile_images", "/avatars", "/images"];
  const hasMediaRelativeRoot = mediaRelativeRoots.some((root) => cleanPath.startsWith(root));

  if (!hasPublicRoot && (hasMediaRelativeRoot || !cleanPath.slice(1).includes("/"))) {
    cleanPath = `/media${cleanPath}`;
  }

  return `${cleanBaseUrl}${encodePathSegments(cleanPath)}`;
};

export const getImageUrlCandidates = (path) => {
  const value = normalizeImagePath(path);

  if (!value) return [];

  if (
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return [value];
  }

  if (value.startsWith("http") || value.startsWith("//")) {
    return [getImageUrl(value)];
  }

  const cleanBaseUrl = getApiBaseUrl().replace(/\/$/, "");
  const cleanPath = value.startsWith("/") ? value : `/${value}`;
  const withoutBackend = cleanPath.replace(/^\/backend/, "");
  const withoutMedia = withoutBackend.replace(/^\/media\//, "/");
  const publicPrefixes = ["/media", "/uploads", "/static", "/storage", "/assets"];

  return Array.from(
    new Set([
      getImageUrl(value),
      `${cleanBaseUrl}${encodePathSegments(withoutBackend)}`,
      `${cleanBaseUrl}${encodePathSegments(withoutMedia)}`,
      ...publicPrefixes.map((prefix) => `${cleanBaseUrl}${encodePathSegments(`${prefix}${withoutMedia}`)}`),
    ])
  );
};

export const getProfileImageSource = (profile) => {
  if (!profile || typeof profile !== "object") return "";

  return (
    profile.profile_image_url ||
    profile.profile_image ||
    profile.profilePicture ||
    profile.profile_picture ||
    profile.profilePic ||
    profile.profile_pic ||
    profile.picture_url ||
    profile.picture ||
    profile.photo_url ||
    profile.photo ||
    profile.avatar_url ||
    profile.avatar ||
    profile.image_url ||
    profile.image ||
    profile.user?.profile_image_url ||
    profile.user?.profile_image ||
    profile.user?.profile_picture ||
    profile.user?.avatar_url ||
    profile.user?.image_url ||
    profile.user?.image ||
    ""
  );
};

export const getVersionedImageUrl = (path, version) => {
  const url = getImageUrl(path);
  if (!url || !version || url.startsWith("data:") || url.startsWith("blob:")) return url;

  return `${url}${url.includes("?") ? "&" : "?"}v=${version}`;
};

export const getVersionedImageUrlCandidates = (path, version) =>
  getImageUrlCandidates(path).map((url) => {
    if (!url || !version || url.startsWith("data:") || url.startsWith("blob:")) return url;
    return `${url}${url.includes("?") ? "&" : "?"}v=${version}`;
  });
