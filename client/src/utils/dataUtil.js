import _ from 'lodash';

const getDescription = (key, definition) => {
  const { description } = definition.properties[key];
  let parsed = description.replace(/(?:\r\n|\r|\n)/g, '');
  if (parsed.indexOf('Note') !== -1) {
    parsed = parsed.substring(0, parsed.indexOf('Note'));
  }
  return JSON.parse(parsed);
};

const transform = (processData, variableData) => {
  return processData.map((p) => {
    const variables = _.filter(variableData, (v) => v.processInstanceId === p.id).map((v) => ({
      type: v.type,
      valueInfo: v.valueInfo,
      id: v.id,
      name: v.name,
      value: v.type === 'Json' ? JSON.parse(v.value) : v.value,
    }));
    return {
      ...p,
      variables,
    };
  });
};

export { getDescription, transform };
