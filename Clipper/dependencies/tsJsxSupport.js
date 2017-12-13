// See: http://blog.stchur.com/2017/06/19/jsx-without-react/
window.customJsxVirtualDomFactory = (nodeName, attributes, ...children) => {
    children = [].concat(...children);
    return renderVirtualDom({ nodeName, attributes, children, virt: true });
};

function renderVirtualDom(vdom) {
    const dom = document.createElement(vdom.nodeName);
    const attrs = (vdom.attributes || {});
    for (let key in attrs) {
        if (attrs.hasOwnProperty(key)) {
            if (key === 'style') {
                const styles = vdom.attributes[key];
                for (let styleName in styles) {
                    if (styles.hasOwnProperty(styleName)) {
                        dom.style[styleName] = styles[styleName];
                    }
                }
            } if (key === 'src' || key === 'href') {
                let val = vdom.attributes[key];

                if (val.toLowerCase().startsWith('/')) {
                    val = window.globalRoutePrefix + val;
                }
                dom.setAttribute(key, val);
            } else {
                const resolvedKey =
                    key.toLowerCase() === 'classname'
                        ? 'class'
                        : key;
                dom.setAttribute(resolvedKey, vdom.attributes[key]);
            }
        }
    }

    for (let child of vdom.children) {
        if (typeof child === 'string') {
            dom.appendChild(document.createTextNode(child));
        } else if (child.virt) {
            dom.appendChild(window.renderVirtualDom(child));
        } else {
            dom.appendChild(child);
        }
    }
    return dom;
}