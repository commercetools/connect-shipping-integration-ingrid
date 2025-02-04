export function replaceScriptNode(node: Node) {
    if (isScriptNode(node) && !isExternalScript(node)) {
        node.parentNode?.replaceChild(cloneScriptNode(node), node);
    } else {
        node.childNodes.forEach(child => replaceScriptNode(child));
    }
    return node;
}

function isScriptNode(node: Node): node is HTMLScriptElement {
    return node.nodeName === "SCRIPT";
}

function isExternalScript(node: HTMLScriptElement) {
    return !!node.src && node.src !== "";
}

function cloneScriptNode(node: HTMLScriptElement): HTMLScriptElement {
    const script = document.createElement("script");
    script.text = node.innerHTML;
    Array.from(node.attributes).forEach(attr =>
        script.setAttribute(attr.name, attr.value)
    );
    return script;
}