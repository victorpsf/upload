const MyRequest = function (url) {
  let request = new XMLHttpRequest();
  request.timeout = 12000;

  return {
    setHeader: function (headers) {
      return this;
    },
    post: function (body) {
      return new Promise((resolve, reject) => {
        const bodyText = JSON.stringify(body);
    
        request.onloadend = function () {
          try {
            resolve(JSON.parse(request.responseText));
          }
    
          catch (error) {
            resolve({
              text: request.responseText
            })
          }
        }
    
        request.open('POST', url);
        request.send(bodyText);
      })
    }
  }
}

const ReadFile = function (file = new File([], '')) {
  return new Promise((resolve) => {
    var reader = new FileReader();

    reader.onloadend = function ({ target: { result } }) {
      resolve({
        name: file.name,
        mime: file.type,
        length: file.size,
        buffer: Object.values(new Uint8Array(result))
      })
    }

    reader.readAsArrayBuffer(file)
  })
}

const FileChange = async function (event = new InputEvent()) {
  const files = event.target.files;

  if ((files && files.length) == false) return;
  for (const file of files) {
    const data = await ReadFile(file);
    const result = await MyRequest('/upload/file').post(data);

    console.log(result);
  }
}