
// preorder traverse DOM tree
export function traverse(root?: ParentNode | Node, cb?: (elem: ParentNode | Node | HTMLElement) => void) {
  if (!root) {
    return null;
  }

  if (cb) {
    cb(root);
  }


  for (let i = 0; i < root?.childNodes?.length; i++) {
    const childNode = root.childNodes[i];
    const isValid = checkIsValidNode(childNode)
    if (!isValid) {
      continue;
    }
    traverse(childNode, cb);
  }

}

function checkIsValidNode(elem: Node | ParentNode) {

  const invalidTags = ['script', 'head', 'data', 'embed', 'html', 'unknown', 'meta', 'link', 'object', 'script', 'noscript', 'source', 'template', 'track', 'title', 'style', 'link', '#text'
  ];

  //https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeValue
  // https://developer.mozilla.org/docs/Web/API/Node/nodeType
  const isElem = !elem.nodeValue && elem.nodeType === 1;
  const isValid = !invalidTags.includes(elem.nodeName.toLowerCase())

  return isElem && isValid
}

traverse(document.body)