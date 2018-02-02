const url = "./assets/image.jpg?v=2"
const memorycache = {}

let instance = localforage.createInstance({
  driver: localforage.INDEXEDDB,
  name: 'imageCache',
})

test()

function loadBinaryImage (path, type, cb) {
  var xhr = new XMLHttpRequest()
  xhr.onload = function(ev){
    var arrayBuffer = this.response
    cb(arrayBuffer)
  }
  xhr.open('GET', path)
  xhr.responseType = type
  xhr.send();
}

function test () {
  // clear the #images element
  document.querySelector('#images').innerHTML = ''

  for (let i = 0; i < 20; i++ ) {
    instance.getItem(`image${i}`).then(item => {
      if (!item || !item.arraybuffer) {
        setCache(i)
        return
      }
  
      if (item.arraybuffer) {
        instance.setItem(`image${i}`, {
          date: Date.now(),
          arraybuffer: item.arraybuffer
        }).then(() => {
          memorycache[url] = arrayBufferToUrl(item.arraybuffer)
          appendImageElement(memorycache[url], '#images')
        })
      }
    }) 
  }
}

/**
 * Close the database connection and re-create
 * localforage instance
 * 
 * It will flush the .wal file
 */
function resetInstance () {
  instance._dbInfo.db.close()
  instance = localforage.createInstance({
    driver: localforage.INDEXEDDB,
    name: 'imageCache',
  })
}


function setCache (name) {
  loadBinaryImage(url, 'arraybuffer', (data) => {
    instance.setItem(`image${name}`, {
      date: Date.now(),
      arraybuffer: data
    }).then(() => {
      memorycache[url] = arrayBufferToUrl(data)
      appendImageElement(memorycache[url], '#images')
    })
  })
}

function arrayBufferToUrl (arrayBuffer) {
  const blob = new Blob([arrayBuffer], { type: 'image/jpg' })
  return window.URL.createObjectURL(blob)
}

/**
 * Append image to specified selector
 * @param {*} url 
 * @param {*} selector 
 */
function appendImageElement (url, selector) {
  var img = document.createElement('img');
  img.src = url
  const body = document.querySelector(selector)
  body.appendChild(img)
}

