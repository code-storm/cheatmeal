import { adminUploadRequest } from "./adminClient";

export const adminUploadApi = {
  upload: (file: File, themeSlug: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("themeSlug", themeSlug);
    return adminUploadRequest<{ url: string }>("/api/admin/upload", formData);
  },
};
