const judgeType = (obj) => {
  return Object.prototype.toString.call(obj)
}

const isArray = (arr) => {
  return judgeType(arr) === '[object Array]'
}

const isStaictObject = (obj) => {
  return judgeType(obj) === '[object Object]'
}

const deepCopy = (source) => {
  if (!isArray(source) && !isStaictObject(source)) {
    throw new Error('the source you support can not be copied')
  }

  var copySource = isArray(source) ? [] : {}
  for (var prop in source) {
    if (source.hasOwnProperty(prop)) {
      if (isArray(source[prop]) || isStaictObject(source[prop])) {
        copySource[prop] = deepCopy(source[prop])
      } else {
        copySource[prop] = source[prop]
      }
    }
  }

  return copySource
}

module.exports = deepCopy
