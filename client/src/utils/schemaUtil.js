export const getDescription = (key, definition) => {
  const { description } = definition.properties[key];
  let parsed = description.replace(/(?:\r\n|\r|\n)/g, '');
  if (parsed.indexOf('Note') !== -1) {
    parsed = parsed.substring(0, parsed.indexOf('Note'));
  }
  return JSON.parse(parsed);
};
