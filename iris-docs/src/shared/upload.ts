export async function uploadFile(file: File) {
  const fd = new FormData();
  fd.append('fileToUpload', file);
  fd.append('submit', 'Upload Image');

  const url = 'https://nostr.build/api/v2/upload/files';
  const headers = {
    accept: 'application/json',
  };

  const rsp = await fetch(url, {
    body: fd,
    method: 'POST',
    headers,
  });

  if (!rsp.ok) {
    return Promise.reject('Upload failed');
  }

  const data = await rsp.json();
  const res = data.data[0];
  return res.url;
}
