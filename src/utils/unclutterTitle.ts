function unclutterTitle(title: string) {
  let newTitle = title.replace(/\s*\(.*?\)\s*/g, '');
  newTitle = title.replace(/\s*\[.*?\]\s*/g, '');
  return newTitle;
}

export default unclutterTitle;
