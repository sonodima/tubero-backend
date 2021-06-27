function isId(id: string) {
  const match = id.match(/^[a-zA-Z0-9-_]{11}$/);
  return match != null;
}

export default isId;
