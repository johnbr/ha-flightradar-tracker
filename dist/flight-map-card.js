function t(t,e,i,r){var s,n=arguments.length,o=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,r);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(o=(n<3?s(o):n>3?s(e,i,o):s(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),s=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,r)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[r+1],t[0]);return new n(i,t,r)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,r))(e)})(t):t,{is:c,defineProperty:l,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,m=globalThis,f=m.trustedTypes,_=f?f.emptyScript:"",g=m.reactiveElementPolyfillSupport,y=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},v=(t,e)=>!c(t,e),b={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(t,i,e);void 0!==r&&l(this.prototype,t,r)}}static getPropertyDescriptor(t,e,i){const{get:r,set:s}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:r,set(e){const n=r?.call(this);s?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...u(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,r)=>{if(i)t.adoptedStyleSheets=r.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of r){const r=document.createElement("style"),s=e.litNonce;void 0!==s&&r.setAttribute("nonce",s),r.textContent=i.cssText,t.appendChild(r)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,i);if(void 0!==r&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:$).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,r=i._$Eh.get(t);if(void 0!==r&&this._$Em!==r){const t=i.getPropertyOptions(r),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=r;const n=s.fromAttribute(e,t.type);this[r]=n??this._$Ej?.get(r)??n,this._$Em=null}}requestUpdate(t,e,i,r=!1,s){if(void 0!==t){const n=this.constructor;if(!1===r&&(s=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??v)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:r,wrapped:s},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==s||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===r&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,r=this[e];!0!==t||this._$AL.has(e)||void 0===r||this.C(e,void 0,i,r)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[y("elementProperties")]=new Map,w[y("finalized")]=new Map,g?.({ReactiveElement:w}),(m.reactiveElementVersions??=[]).push("2.1.2");const A=globalThis,x=t=>t,k=A.trustedTypes,S=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+C,T=`<${M}>`,z=document,P=()=>z.createComment(""),N=t=>null===t||"object"!=typeof t&&"function"!=typeof t,U=Array.isArray,L="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,H=/>/g,R=RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,D=/"/g,F=/^(?:script|style|textarea|title)$/i,V=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),W=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),B=new WeakMap,G=z.createTreeWalker(z,129);function K(t,e){if(!U(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const Z=(t,e)=>{const i=t.length-1,r=[];let s,n=2===e?"<svg>":3===e?"<math>":"",o=O;for(let e=0;e<i;e++){const i=t[e];let a,c,l=-1,h=0;for(;h<i.length&&(o.lastIndex=h,c=o.exec(i),null!==c);)h=o.lastIndex,o===O?"!--"===c[1]?o=I:void 0!==c[1]?o=H:void 0!==c[2]?(F.test(c[2])&&(s=RegExp("</"+c[2],"g")),o=R):void 0!==c[3]&&(o=R):o===R?">"===c[0]?(o=s??O,l=-1):void 0===c[1]?l=-2:(l=o.lastIndex-c[2].length,a=c[1],o=void 0===c[3]?R:'"'===c[3]?D:j):o===D||o===j?o=R:o===I||o===H?o=O:(o=R,s=void 0);const d=o===R&&t[e+1].startsWith("/>")?" ":"";n+=o===O?i+T:l>=0?(r.push(a),i.slice(0,l)+E+i.slice(l)+C+d):i+C+(-2===l?e:d)}return[K(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),r]};class J{constructor({strings:t,_$litType$:e},i){let r;this.parts=[];let s=0,n=0;const o=t.length-1,a=this.parts,[c,l]=Z(t,e);if(this.el=J.createElement(c,i),G.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(r=G.nextNode())&&a.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(E)){const e=l[n++],i=r.getAttribute(t).split(C),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:s,name:o[2],strings:i,ctor:"."===o[1]?et:"?"===o[1]?it:"@"===o[1]?rt:tt}),r.removeAttribute(t)}else t.startsWith(C)&&(a.push({type:6,index:s}),r.removeAttribute(t));if(F.test(r.tagName)){const t=r.textContent.split(C),e=t.length-1;if(e>0){r.textContent=k?k.emptyScript:"";for(let i=0;i<e;i++)r.append(t[i],P()),G.nextNode(),a.push({type:2,index:++s});r.append(t[e],P())}}}else if(8===r.nodeType)if(r.data===M)a.push({type:2,index:s});else{let t=-1;for(;-1!==(t=r.data.indexOf(C,t+1));)a.push({type:7,index:s}),t+=C.length-1}s++}}static createElement(t,e){const i=z.createElement("template");return i.innerHTML=t,i}}function Y(t,e,i=t,r){if(e===W)return e;let s=void 0!==r?i._$Co?.[r]:i._$Cl;const n=N(e)?void 0:e._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),void 0===n?s=void 0:(s=new n(t),s._$AT(t,i,r)),void 0!==r?(i._$Co??=[])[r]=s:i._$Cl=s),void 0!==s&&(e=Y(t,s._$AS(t,e.values),s,r)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,r=(t?.creationScope??z).importNode(e,!0);G.currentNode=r;let s=G.nextNode(),n=0,o=0,a=i[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new X(s,s.nextSibling,this,t):1===a.type?e=new a.ctor(s,a.name,a.strings,this,t):6===a.type&&(e=new st(s,this,t)),this._$AV.push(e),a=i[++o]}n!==a?.index&&(s=G.nextNode(),n++)}return G.currentNode=z,r}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,r){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Y(this,t,e),N(t)?t===q||null==t||""===t?(this._$AH!==q&&this._$AR(),this._$AH=q):t!==this._$AH&&t!==W&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>U(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==q&&N(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,r="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(e);else{const t=new Q(r,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=B.get(t.strings);return void 0===e&&B.set(t.strings,e=new J(t)),e}k(t){U(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,r=0;for(const s of t)r===e.length?e.push(i=new X(this.O(P()),this.O(P()),this,this.options)):i=e[r],i._$AI(s),r++;r<e.length&&(this._$AR(i&&i._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=x(t).nextSibling;x(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,r,s){this.type=1,this._$AH=q,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(t,e=this,i,r){const s=this.strings;let n=!1;if(void 0===s)t=Y(this,t,e,0),n=!N(t)||t!==this._$AH&&t!==W,n&&(this._$AH=t);else{const r=t;let o,a;for(t=s[0],o=0;o<s.length-1;o++)a=Y(this,r[i+o],e,o),a===W&&(a=this._$AH[o]),n||=!N(a)||a!==this._$AH[o],a===q?t=q:t!==q&&(t+=(a??"")+s[o+1]),this._$AH[o]=a}n&&!r&&this.j(t)}j(t){t===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===q?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==q)}}class rt extends tt{constructor(t,e,i,r,s){super(t,e,i,r,s),this.type=5}_$AI(t,e=this){if((t=Y(this,t,e,0)??q)===W)return;const i=this._$AH,r=t===q&&i!==q||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==q&&(i===q||r);r&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Y(this,t)}}const nt=A.litHtmlPolyfillSupport;nt?.(J,X),(A.litHtmlVersions??=[]).push("3.3.3");const ot=globalThis;let at=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const r=i?.renderBefore??e;let s=r._$litPart$;if(void 0===s){const t=i?.renderBefore??null;r._$litPart$=s=new X(e.insertBefore(P(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}};at._$litElement$=!0,at.finalized=!0,ot.litElementHydrateSupport?.({LitElement:at});const ct=ot.litElementPolyfillSupport;ct?.({LitElement:at}),(ot.litElementVersions??=[]).push("4.2.2");const lt={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:v},ht=(t=lt,e,i)=>{const{kind:r,metadata:s}=i;let n=globalThis.litPropertyMetadata.get(s);if(void 0===n&&globalThis.litPropertyMetadata.set(s,n=new Map),"setter"===r&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===r){const{name:r}=i;return{set(i){const s=e.get.call(this);e.set.call(this,i),this.requestUpdate(r,s,t,!0,i)},init(e){return void 0!==e&&this.C(r,void 0,t,e),e}}}if("setter"===r){const{name:r}=i;return function(i){const s=this[r];e.call(this,i),this.requestUpdate(r,s,t,!0,i)}}throw Error("Unsupported decorator location: "+r)};function dt(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const r=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),r?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function ut(t){return dt({...t,state:!0,attribute:!1})}const pt=new Set(["type","view_layout","layout_options","grid_options","visibility","card_mod"]),mt=new Set(["entity","title","map_height","zoom","zoom_offset","theme_mode","show_tracks","show_area_center","show_photo","icon_size","units"]),ft="flight-map-card",_t="flight-map-card-editor",gt={altitude:"ft",speed:"mph",distance:"mi"},yt=["auto","light","dark"],$t={altitude:["ft","m"],speed:["mph","kts","kmh"],distance:["mi","km","nm"]},vt={map_height:[120,1200],icon_size:[12,72],zoom:[1,20],zoom_offset:[-2,3]},bt=460,wt=1,At="auto",xt=!0,kt=!0,St=!0,Et=28;function Ct(t){throw new Error(t)}function Mt(t){if(null==t||""===t)return null;const e=Number(t);return Number.isFinite(e)?e:null}function Tt(t){return"string"==typeof t?""===t.trim()?null:t:null}function zt(t){if(!Array.isArray(t))return[];const e=[];for(const i of t){if(!Array.isArray(i)||i.length<2)continue;const t=Mt(i[0]),r=Mt(i[1]);null!==t&&null!==r&&(Math.abs(t)>90||Math.abs(r)>180||e.push([t,r]))}return e}function Pt(t){return Tt(t.id)??Tt(t.callsign)??Tt(t.aircraft_registration)??Tt(t.aircraft_icao_24bit)}function Nt(t){return"helicopter"===(t.aircraft_category??"").toLowerCase()}function Ut(t){return 1===Number(t.on_ground)}function Lt(t){const e=null===t.heading?0:Math.round(t.heading)%360;return`${Nt(t)?"h":"p"}|${e}|${Ut(t)?"g":"a"}`}function Ot(t){const e=t.coordinates;if(!e.length)return"0";const i=e[0],r=e[e.length-1];return`${e.length}|${i[0]},${i[1]}|${r[0]},${r[1]}`}function It(t){if(!Array.isArray(t))return[];const e=new Set,i=[];for(const r of t){if(!r||"object"!=typeof r||Array.isArray(r))continue;const t=r,s=Pt(t);if(!s||e.has(s))continue;const n=Mt(t.latitude),o=Mt(t.longitude);null!==n&&null!==o&&(Math.abs(n)>90||Math.abs(o)>180||(e.add(s),i.push({...t,id:s,latitude:n,longitude:o,altitude:Mt(t.altitude),heading:Mt(t.heading),ground_speed:Mt(t.ground_speed),vertical_speed:Mt(t.vertical_speed),distance:Mt(t.distance),closest_distance:Mt(t.closest_distance),on_ground:Mt(t.on_ground),coordinates:zt(t.coordinates)})))}return function(t){return[...t].sort((t,e)=>{const i=t.distance??Number.POSITIVE_INFINITY,r=e.distance??Number.POSITIVE_INFINITY;return i!==r?i-r:t.id<e.id?-1:t.id>e.id?1:0})}(i)}function Ht(t){return t.callsign??t.flight_number??t.aircraft_registration??t.id}const Rt=Math.PI/180;function jt(t,e){const[i,r]=t,[s,n]=e,o=(s-i)*Rt,a=(n-r)*Rt,c=Math.sin(o/2)**2+Math.cos(i*Rt)*Math.cos(s*Rt)*Math.sin(a/2)**2;return 12742.0176*Math.asin(Math.min(1,Math.sqrt(c)))}function Dt(t,e){return"number"!=typeof t||"number"!=typeof e?null:Number.isFinite(t)&&Number.isFinite(e)?0===t&&0===e?null:[t,e]:null}function Ft(t,e){return 0===e?t:((1+2*t)*2**-e-1)/2}let Vt;let Wt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const qt={},Bt=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends Wt{constructor(){super(...arguments),this.key=q}render(t,e){return this.key=t,e}update(t,[e,i]){return e!==this.key&&(((t,e=qt)=>{t._$AH=e})(t),this.key=e),i}}),Gt=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];function Kt(t){return"number"==typeof t&&Number.isFinite(t)}function Zt(t,e=0){const i=Math.abs(t).toFixed(e),[r,s]=i.split("."),n=(r??"0").replace(/\B(?=(\d{3})+(?!\d))/g,","),o=t<0?"-":"";return s?`${o}${n}.${s}`:`${o}${n}`}function Jt(t,e){return Kt(t)?"km"===e?`${Zt(t,1)} km`:"nm"===e?`${Zt(.539957*t,1)} nm`:`${Zt(.621371*t,1)} mi`:null}function Yt(t){if(!Kt(t))return null;const e=Math.round((t%360+360)%360)%360;return`${String(e).padStart(3,"0")}° ${function(t){const e=(t%360+360)%360;return Gt[Math.round(e/22.5)%16]}(e)}`}function Qt(t){return"number"!=typeof t||!Number.isFinite(t)||t<=0?null:t}function Xt(t,e){return new Date(1e3*(t+e))}function te(t,e){const i=Xt(t,e),r=String(i.getUTCMonth()+1).padStart(2,"0"),s=String(i.getUTCDate()).padStart(2,"0");return`${i.getUTCFullYear()}-${r}-${s}`}function ee(t,e,i,r){const s=Qt(t);if(null===s)return null;if("number"!=typeof e||!Number.isFinite(e))return null;const n=Xt(s,e),o=n.getUTCHours(),a=String(n.getUTCMinutes()).padStart(2,"0");return`${r?`${(o+11)%12+1}:${a} ${o<12?"AM":"PM"}`:`${String(o).padStart(2,"0")}:${a}`}${"string"==typeof i&&""!==i.trim()?` ${i.trim()}`:""}`}function ie(t){const e=t.target?.closest("figure");e instanceof HTMLElement&&(e.style.display="none")}function re(t,e){return null===e?q:V`<div class="cell"><div class="k">${t}</div><div class="v">${e}</div></div>`}function se(t){return t?V`<span class="chip">${t}</span>`:q}function ne(t){return t.callsign??t.flight_number??t.aircraft_registration??t.id}function oe(t,e,i){const r=e?t.airport_destination_code_iata:t.airport_origin_code_iata;if(!r)return null;const s=e?t.airport_destination_timezone_offset:t.airport_origin_timezone_offset,n=e?t.airport_destination_timezone_abbr:t.airport_origin_timezone_abbr,o=Qt(e?t.time_real_arrival:t.time_real_departure),a=Qt(e?t.time_estimated_arrival:t.time_estimated_departure),c=Qt(e?t.time_scheduled_arrival:t.time_scheduled_departure),l=o??a??c,h=o?e?"Arrived":"Departed":a?e?"Arrives (est)":"Departs (est)":e?"Arrives":"Departs";return{code:r,city:e?t.airport_destination_city:t.airport_origin_city,label:h,time:ee(l,s,n,i),scheduled:null!==c&&null!==l&&c!==l?ee(c,s,null,i):null,epoch:l,offset:"number"==typeof s?s:null}}function ae(t,e,i){return V`
    <div class="port ${i?"right":""}">
      <div class="iata">${t.code}</div>
      ${t.city?V`<div class="city">${t.city}</div>`:q}
      ${t.time?V`<div class="t-label">${t.label}</div>
            <div class="t-value">${t.time}${e?V`<sup class="day">${e}</sup>`:q}</div>`:q}
      ${t.scheduled?V`<div class="t-sched">sched ${t.scheduled}</div>`:q}
    </div>
  `}function ce(t,e,i){const r=oe(t,!1,i),s=oe(t,!0,i);if(!r||!s)return q;const n=function(t,e,i,r){const s=Qt(t),n=Qt(i);if(null===s||null===n)return 0;if("number"!=typeof e||"number"!=typeof r)return 0;const o=Date.parse(`${te(s,e)}T00:00:00Z`),a=Date.parse(`${te(n,r)}T00:00:00Z`);return Math.round((a-o)/864e5)}(r.epoch,r.offset,s.epoch,s.offset),o=n>0?`+${n}`:n<0?`${n}`:"",a=function(t,e,i){if(!t||!i)return null;const r=jt(t,e),s=jt(e,i),n=r+s;return n<=0?null:{flownKm:r,remainingKm:s,fraction:Math.min(1,Math.max(0,r/n))}}(Dt(t.airport_origin_latitude,t.airport_origin_longitude),[t.latitude,t.longitude],Dt(t.airport_destination_latitude,t.airport_destination_longitude)),c=a?function(t){if("number"!=typeof t||!Number.isFinite(t)||t<0)return null;const e=Math.round(t);if(e<1)return"< 1m";const i=Math.floor(e/60),r=e%60;return i?`${i}h ${String(r).padStart(2,"0")}m`:`${r}m`}(function(t,e,i,r){const s=Qt(t);return null!==s&&s>r?(s-r)/60:"number"==typeof e&&Number.isFinite(e)&&"number"==typeof i&&Number.isFinite(i)&&i>0?.539957*e/i*60:null}(t.time_estimated_arrival??t.time_scheduled_arrival,a.remainingKm,t.ground_speed,Math.floor(Date.now()/1e3))):null,l=a?Math.floor(100*a.fraction):0;return V`
    <div class="route">
      <div class="leg">
        ${ae(r,"",!1)}
        <div class="arrow" aria-hidden="true">→</div>
        ${ae(s,o,!0)}
      </div>
      ${a?V`
            <div
              class="bar"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow=${l}
            >
              <div class="fill" style="width:${l}%"></div>
            </div>
            <div class="legend">
              <span>${Jt(a.flownKm,e.distance)} flown</span>
              <span>
                ${Jt(a.remainingKm,e.distance)} to run${c?` · ${c}`:""}
              </span>
            </div>
          `:q}
    </div>
  `}function le(t,e,i){const r=e.units,s=e.show_photo?function(t){return t.aircraft_photo_medium??t.aircraft_photo_large??t.aircraft_photo_small}(t):null,n=function(t,e){const i=(t??"").trim(),r=(e??"").trim();return i&&r?`https://fr24.com/${encodeURIComponent(r)}/${encodeURIComponent(i)}`:r?`https://www.flightradar24.com/${encodeURIComponent(r)}`:i?`https://www.flightradar24.com/${encodeURIComponent(i)}`:null}(t.id,ne(t)),o=function(t){const e=t.airline_short??t.airline;return[t.aircraft_model,e].filter(t=>!!t).join(" · ")}(t);return V`
    <div class="detail">
      <div class="d-head">
        <div class="d-name">${ne(t)}</div>
        <div class="chips">${se(t.aircraft_code)}${se(t.aircraft_registration)}</div>
      </div>
      ${o?V`<div class="d-sub">${o}</div>`:q}
      ${s?Bt(s,V`<figure class="photo">
              <img src=${s} alt=${ne(t)} loading="lazy" @error=${ie} />
            </figure>`):q}
      ${ce(t,r,i)}
      <div class="grid">
        ${re("Altitude",(c=t.altitude,l=r.altitude,Kt(c)?"m"===l?`${Zt(.3048*c)} m`:`${Zt(c)} ft`:null))}
        ${re("Vertical",(a=t.vertical_speed,Kt(a)?Math.abs(a)<50?"Level":`${a>0?"↑":"↓"} ${Zt(Math.abs(a))} ft/min`:null))}
        ${re("Ground speed",function(t,e){return Kt(t)?"kts"===e?`${Zt(t)} kts`:"kmh"===e?`${Zt(1.852*t)} km/h`:`${Zt(1.15078*t)} mph`:null}(t.ground_speed,r.speed))}
        ${re("Track",Yt(t.heading))}
        ${re("Distance",Jt(t.distance,r.distance))}
        ${re("Closest",Jt(t.closest_distance,r.distance))}
        ${re("Squawk",function(t){if("string"!=typeof t)return null;const e=t.trim();return""===e||"0000"===e?null:e}(t.squawk))}
        ${re("ICAO 24-bit",t.aircraft_icao_24bit)}
      </div>
      ${n?V`<a class="fr24" href=${n} target="_blank" rel="noopener noreferrer"
            >View on Flightradar24</a
          >`:q}
    </div>
  `;var a,c,l}function he(t){return t.replace(/["'<>]/g,"")}function de(t,e,i){const r=null===e.heading?0:Math.round(e.heading),s=e.grounded,n=e.selected?i.selectedColor:s?i.groundColor:i.color,o=e.helicopter?function(t,e){const i=he(e),r=he(t.outline);return`<g stroke="${r}" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.9"><path d="M4.6 4.6 L19.4 19.4"></path><path d="M19.4 4.6 L4.6 19.4"></path></g><g stroke="${i}" stroke-width="1.1" stroke-linecap="round" fill="none"><path d="M4.6 4.6 L19.4 19.4"></path><path d="M19.4 4.6 L4.6 19.4"></path></g><rect x="11.1" y="12.4" width="1.8" height="8" rx="0.9" fill="${i}" stroke="${r}" stroke-width="1" paint-order="stroke"></rect><rect x="8.7" y="19.2" width="6.6" height="1.6" rx="0.8" fill="${i}" stroke="${r}" stroke-width="1" paint-order="stroke"></rect><ellipse cx="12" cy="10" rx="3.1" ry="4.3" fill="${i}" stroke="${r}" stroke-width="1.2" paint-order="stroke"></ellipse>`}(i,n):function(t,e){return`<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="${he(e)}" stroke="${he(t.outline)}" stroke-width="1.4" stroke-linejoin="round" paint-order="stroke"></path>`}(i,n),a=(e.selected?`<circle cx="12" cy="12" r="11" fill="${he(i.selectedColor)}" opacity="0.25"></circle>`:"")+o,c=i.size/2;return t.divIcon({className:"fmc-aircraft",iconSize:[i.size,i.size],iconAnchor:[c,c],html:`<div style="width:${i.size}px;height:${i.size}px;transform:rotate(${r}deg);transform-origin:50% 50%;${s?"opacity:0.55;":""}"><svg viewBox="0 0 24 24" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${a}</svg></div>`})}const ue=o`
  :host {
    display: block;
  }

  ha-card {
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px 8px;
  }

  .title {
    font-family: var(--ha-card-header-font-family, inherit);
    font-size: var(--ha-card-header-font-size, 24px);
    line-height: 1.2;
    color: var(--ha-card-header-color, var(--primary-text-color));
    letter-spacing: -0.012em;
  }

  .count {
    flex: 0 0 auto;
    font-size: 0.85rem;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  /*
   * The map's frame. Position is relative only so the recentre control can sit
   * over it -- nothing here may touch the map's own gesture handling. In
   * particular: never set touch-action on or around the map. Leaflet manages
   * its own touch handling, and "touch-action: none" is what cost the
   * air-quality card pinch-zoom across the whole dashboard.
   */
  .map-wrap,
  .placeholder {
    height: var(--fmc-map-height, 460px);
  }

  .map-wrap {
    position: relative;
  }

  /*
   * On a phone the configured height is usually somebody's desktop number, and
   * a 460 px map plus a detail panel is most of the screen. Cap it rather than
   * override it, so a deliberately short map stays short.
   */
  @media (max-width: 699px) {
    .map-wrap,
    .placeholder {
      height: min(var(--fmc-map-height, 460px), 300px);
    }
  }

  ha-map {
    display: block;
    height: 100%;
    width: 100%;
  }

  .recentre {
    position: absolute;
    top: 8px;
    right: 8px;
    /* Leaflet's own controls sit at 800; this has to clear them. */
    z-index: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: var(--primary-text-color);
    background: var(--card-background-color, var(--ha-card-background, #fff));
    box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.3));
    opacity: 0.9;
  }

  .recentre:hover {
    opacity: 1;
  }

  .recentre svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
    font-size: 0.9rem;
    text-align: center;
    padding: 0 16px;
  }

  /*
   * The detail panel. Below the map, never over it: selecting an aircraft must
   * not obscure the thing you selected it from, and must not resize the map.
   */
  .detail {
    padding: 12px 16px 16px;
    border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
  }

  /* Fixed height, so the card does not collapse when nothing is selected. */
  .detail.empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 56px;
    color: var(--secondary-text-color);
    font-size: 0.9rem;
  }

  .d-head {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
  }

  .d-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chip {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.72rem;
    letter-spacing: 0.03em;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.14));
  }

  .d-sub {
    margin-top: 2px;
    font-size: 0.9rem;
    color: var(--secondary-text-color);
  }

  .photo {
    margin: 10px 0 0;
  }

  .photo img {
    display: block;
    width: 100%;
    max-height: 220px;
    object-fit: cover;
    border-radius: var(--ha-card-border-radius, 12px);
  }

  /* Route: two airports, the bar between them, and what is left to fly. */
  .route {
    margin-top: 12px;
  }

  .leg {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: start;
    gap: 8px;
  }

  .port.right {
    text-align: right;
  }

  .iata {
    font-size: 1.15rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--primary-text-color);
  }

  .city {
    font-size: 0.8rem;
    color: var(--secondary-text-color);
  }

  .arrow {
    align-self: center;
    color: var(--secondary-text-color);
  }

  .t-label {
    margin-top: 6px;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--secondary-text-color);
  }

  .t-value {
    font-size: 0.95rem;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }

  /* The airline "+1": small, raised, and never mistaken for part of the time. */
  .day {
    margin-left: 2px;
    font-size: 0.65em;
    color: var(--primary-color);
  }

  .t-sched {
    font-size: 0.75rem;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
  }

  .bar {
    position: relative;
    height: 6px;
    margin: 12px 0 6px;
    border-radius: 3px;
    overflow: hidden;
    background: var(--divider-color, rgba(127, 127, 127, 0.25));
  }

  .fill {
    height: 100%;
    border-radius: 3px;
    background: var(--primary-color);
    /* The fraction moves once a tick; let it slide rather than snap. */
    transition: width 1s linear;
  }

  @media (prefers-reduced-motion: reduce) {
    .fill {
      transition: none;
    }
  }

  .legend {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.78rem;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
    gap: 10px 12px;
    margin-top: 12px;
  }

  .cell .k {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--secondary-text-color);
  }

  .cell .v {
    font-size: 1rem;
    color: var(--primary-text-color);
    /* Figures that change every minute should not shuffle their neighbours. */
    font-variant-numeric: tabular-nums;
  }

  .fr24 {
    display: inline-block;
    margin-top: 12px;
    font-size: 0.85rem;
    color: var(--primary-color);
    text-decoration: none;
  }

  .fr24:hover {
    text-decoration: underline;
  }

  .body {
    padding: 8px 16px 16px;
    color: var(--secondary-text-color);
    font-size: 0.9rem;
  }

  .error {
    color: var(--error-color);
  }
`,pe=new URL(import.meta.url).searchParams.get("v")??"dev";function me(t,e){return{heading:t.heading,helicopter:Nt(t),grounded:Ut(t),selected:e}}window.customCards=window.customCards??[],window.customCards.some(t=>t.type===ft)||(window.customCards.push({type:ft,name:"Flight Map Card",description:"Interactive map of the aircraft overhead; tap one for its full detail.",preview:!1,documentationURL:"https://github.com/johnbr/ha-flightradar-tracker"}),console.info(`%c FLIGHT-MAP-CARD %c ${pe} `,"color:#fff;background:#1f2933;font-weight:700","color:#1f2933;background:#4fc3f7;font-weight:700"));class fe extends at{constructor(){super(...arguments),this._signature="",this._mapAvailable=null,this._markers=new Map,this._tracks=new Map,this._drawn=new Map,this._parsedFor="",this._parsed=[],this._fitted=!1,this._syncing=!1,this._resync=!1,this._lastTickAt=0,this._glideMs=1e3,this._gliding=[],this._onRecentre=()=>{const t=this._mapEl();t&&this._fitToArea(t)}}static{this.styles=ue}set hass(t){this._hass=t;const e=this._computeSignature();if(e===this._signature)return;this._signature=e;const i=Date.now();this._lastTickAt&&(this._glideMs=Math.min(Math.max(i-this._lastTickAt,1e3),3e4)),this._lastTickAt=i,this.requestUpdate()}get hass(){return this._hass}setConfig(t){this._config=function(t){const e={type:t.type,entity:t.entity,map_height:t.map_height??bt,show_tracks:t.show_tracks??xt,show_area_center:t.show_area_center??kt,show_photo:t.show_photo??St,icon_size:t.icon_size??Et,zoom_offset:t.zoom_offset??wt,theme_mode:t.theme_mode??At,units:{...gt,...t.units}};return void 0!==t.title&&(e.title=t.title),void 0!==t.zoom&&(e.zoom=t.zoom),e}(function(t){t&&"object"==typeof t&&!Array.isArray(t)||Ct("Invalid configuration");const e=t,i=[...mt].sort().join(", ");for(const t of Object.keys(e))pt.has(t)||mt.has(t)||Ct(`Unknown option "${t}". Known options: ${i}`);const r=e.entity;"string"==typeof r&&""!==r.trim()||Ct("`entity` is required: the Flightradar24 area sensor, e.g. sensor.flightradar24_current_in_area"),r.startsWith("sensor.")||Ct(`\`entity\` must be a sensor, got "${r}"`);const s=e.title;void 0!==s&&"string"!=typeof s&&Ct("`title` must be a string");const n={type:"string"==typeof e.type?e.type:`custom:${ft}`,entity:r.trim()};void 0!==s&&(n.title=s);for(const t of["map_height","icon_size","zoom","zoom_offset"]){const i=e[t];if(void 0===i)continue;const[r,s]=vt[t];"number"==typeof i&&Number.isFinite(i)||Ct(`\`${t}\` must be a number`),(i<r||i>s)&&Ct(`\`${t}\` must be between ${r} and ${s}, got ${i}`),"zoom_offset"!==t||Number.isInteger(i)||Ct("`zoom_offset` must be a whole number of zoom levels"),n[t]=i}for(const t of["show_tracks","show_area_center","show_photo"]){const i=e[t];void 0!==i&&("boolean"!=typeof i&&Ct(`\`${t}\` must be true or false`),n[t]=i)}const o=e.theme_mode;void 0!==o&&("string"==typeof o&&yt.includes(o)||Ct(`\`theme_mode\` must be one of ${yt.join(", ")}, got ${JSON.stringify(o)}`),n.theme_mode=o);const a=e.units;if(void 0!==a){a&&"object"==typeof a&&!Array.isArray(a)||Ct("`units` must be a mapping");const t=a,e={};for(const[i,r]of Object.entries(t)){const t=$t[i];t||Ct(`Unknown unit "${i}". Known units: ${Object.keys($t).join(", ")}`),"string"==typeof r&&t.includes(r)||Ct(`\`units.${i}\` must be one of ${t.join(", ")}, got ${JSON.stringify(r)}`),e[i]=r}n.units=e}return n}(t)),this._signature=this._computeSignature(),this._resetDrawing()}static async getConfigElement(){return await Promise.resolve().then(function(){return $e}),document.createElement(_t)}static getStubConfig(t,e){const i=["current_in_area","entered_area","exited_area","additional_tracked"],r=e.find(t=>t.startsWith("sensor.")&&i.some(e=>t.endsWith(e)))??e.find(t=>t.startsWith("sensor.")&&t.includes("flightradar"));return{type:`custom:${ft}`,entity:r??""}}getCardSize(){return 8}getGridOptions(){return{columns:12,min_columns:6,rows:"auto",min_rows:6}}connectedCallback(){super.connectedCallback(),null===this._mapAvailable&&async function(){return!!customElements.get("ha-map")||(Vt??=(async()=>{try{const t=await(window.loadCardHelpers?.());if(!t)return!1;await t.createCardElement({type:"map",show_all:!0})}catch{}return!!customElements.get("ha-map")||Promise.race([customElements.whenDefined("ha-map").then(()=>!0),new Promise(t=>setTimeout(()=>t(!1),1e4))])})(),Vt)}().then(t=>{this._mapAvailable=t}),this._syncMap()}disconnectedCallback(){this._endGlide(),this._mapInstance=void 0,this._baseLayer=void 0,this._trackLayer=void 0,this._markerLayer=void 0,this._centreMarker=void 0,this._markers.clear(),this._tracks.clear(),this._drawn.clear(),this._fitted=!1,super.disconnectedCallback()}updated(t){this._syncMap()}_resetDrawing(){this._endGlide(),this._baseLayer?.clearLayers(),this._trackLayer?.clearLayers(),this._markerLayer?.clearLayers(),this._centreMarker=void 0,this._markers.clear(),this._tracks.clear(),this._drawn.clear()}_computeSignature(){const t=this._config?.entity;if(!t)return"";const e=this._hass?.states?.[t];return e?`${t}|${e.state}|${e.last_updated}`:`${t}|missing`}_entity(){const t=this._config?.entity;return t?this._hass?.states?.[t]:void 0}_flights(){return this._parsedFor!==this._signature&&(this._parsedFor=this._signature,this._parsed=It(this._entity()?.attributes?.flights)),this._parsed}_bounds(){return function(t){if("string"!=typeof t)return null;const e=t.split(",");if(4!==e.length)return null;const i=e.map(t=>Number(t.trim()));if(i.some(t=>!Number.isFinite(t)))return null;const[r,s,n,o]=i;return Math.abs(r)>90||Math.abs(s)>90||Math.abs(n)>180||Math.abs(o)>180?null:{north:Math.max(r,s),south:Math.min(r,s),west:n,east:o}}(this._entity()?.attributes?.bounds)}_title(t){if(void 0!==this._config?.title)return this._config.title;const e=t?.attributes?.friendly_name;return"string"==typeof e?e:"Flights overhead"}_mapEl(){return this.renderRoot?.querySelector("ha-map")??null}_themeColor(t,e){return getComputedStyle(this).getPropertyValue(t).trim()||e}async _syncMap(){if(!0!==this._mapAvailable)return;if(this._syncing)return void(this._resync=!0);const t=this._mapEl();if(t){this._syncing=!0;try{const e=await async function(t){const e=Date.now()+5e3;for(;(!t.Leaflet||!t._loaded)&&Date.now()<e;)await new Promise(t=>setTimeout(t,50));return t._loaded?t.Leaflet:void 0}(t),i=t.leafletMap;if(!e||!i)return;i!==this._mapInstance&&(this._mapInstance=i,i.on("zoomstart",()=>this._endGlide()),this._baseLayer=e.layerGroup().addTo(i),this._trackLayer=e.layerGroup().addTo(i),this._markerLayer=e.layerGroup().addTo(i),this._centreMarker=void 0,this._markers.clear(),this._tracks.clear(),this._drawn.clear(),this._fitted=!1),this._drawAreaCentre(e),this._syncFlights(e),this._fitted||(this._fitted=!0,await t.updateComplete,this._fitToArea(t))}finally{this._syncing=!1,this._resync&&(this._resync=!1,this._syncMap())}}}_syncFlights(t){const e=this._markerLayer,i=this._trackLayer;if(!e||!i)return;const r=this._flights(),s=function(t,e){const i=[],r=[],s=new Set;for(const n of e){s.add(n.id);const e=t.get(n.id);if(!e){i.push(n);continue}const o=e.latitude!==n.latitude||e.longitude!==n.longitude,a=Lt(e)!==Lt(n),c=Ot(e)!==Ot(n);(o||a||c)&&r.push({flight:n,moved:o,restyled:a,retracked:c})}const n=[];for(const e of t.keys())s.has(e)||n.push(e);return{added:i,changed:r,removed:n}}(this._drawn,r);if(!s.added.length&&!s.changed.length&&!s.removed.length)return;const n=this._iconStyle();for(const t of s.removed){const r=this._markers.get(t);r&&(e.removeLayer(r),this._markers.delete(t));const s=this._tracks.get(t);s&&(i.removeLayer(s),this._tracks.delete(t)),this._selectedId===t&&(this._selectedId=void 0)}for(const i of s.added){const r=i.id,s=t.marker([i.latitude,i.longitude],{icon:de(t,me(i,r===this._selectedId),n),title:Ht(i),keyboard:!1});s.on("click",()=>this._select(r)),s.addTo(e),this._markers.set(r,s),this._drawTrack(t,i,n)}for(const{flight:e,moved:i,restyled:r,retracked:o}of s.changed){const s=this._markers.get(e.id);s&&(r&&s.setIcon(de(t,me(e,e.id===this._selectedId),n)),i&&(this._glide(s),s.setLatLng([e.latitude,e.longitude]))),o&&this._drawTrack(t,e,n)}this._gliding.length&&(window.clearTimeout(this._glideTimer),this._glideTimer=window.setTimeout(()=>this._endGlide(),this._glideMs+200)),this._drawn=function(t){return new Map(t.map(t=>[t.id,t]))}(r)}_drawTrack(t,e,i){const r=this._trackLayer;if(!r)return;const s=e.coordinates,n=this._tracks.get(e.id);if(s.length<2||!this._config?.show_tracks)return void(n&&(r.removeLayer(n),this._tracks.delete(e.id)));if(n)return void n.setLatLngs(s);const o=e.id===this._selectedId,a=t.polyline(s,{...o?this._selectedTrackStyle(i):{color:i.color,weight:2,opacity:.45},lineJoin:"round",lineCap:"round",interactive:!1});a.addTo(r),this._tracks.set(e.id,a),o&&a.bringToFront()}_iconStyle(){return{size:this._config?.icon_size??Et,color:this._themeColor("--primary-text-color","#212121"),outline:this._themeColor("--card-background-color","#ffffff"),groundColor:this._themeColor("--disabled-text-color","#8f8f8f"),selectedColor:this._themeColor("--primary-color","#03a9f4")}}_select(t){if(this._selectedId===t)return;const e=this._selectedId;this._selectedId=t,this._paintSelection(e);const i=this._drawn.get(t);i&&this._mapInstance?.panTo([i.latitude,i.longitude],{animate:!0})}_paintSelection(t){const e=this._mapEl()?.Leaflet;if(!e)return;const i=this._iconStyle();if(t&&t!==this._selectedId){const r=this._drawn.get(t),s=this._markers.get(t);r&&s&&s.setIcon(de(e,me(r,!1),i)),this._tracks.get(t)?.setStyle({color:i.color,weight:2,opacity:.45})}const r=this._selectedId;if(!r)return;const s=this._drawn.get(r),n=this._markers.get(r);s&&n&&n.setIcon(de(e,me(s,!0),i)),this._tracks.get(r)?.setStyle(this._selectedTrackStyle(i)).bringToFront()}_glide(t){if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;const e=t.getElement();e&&(e.style.transition=`transform ${this._glideMs}ms linear`,this._gliding.push(e))}_endGlide(){void 0!==this._glideTimer&&(window.clearTimeout(this._glideTimer),this._glideTimer=void 0);for(const t of this._gliding)t.style.transition="";this._gliding=[]}_selectedTrackStyle(t){return{color:t.selectedColor,weight:3,opacity:.9}}_drawAreaCentre(t){const e=this._bounds();if(!e||!this._baseLayer||!this._config?.show_area_center)return;const i=function(t){return[(t.north+t.south)/2,(t.west+t.east)/2]}(e);this._centreMarker?this._centreMarker.setLatLng(i):this._centreMarker=t.circleMarker(i,{radius:5,weight:2,color:this._themeColor("--primary-color","#03a9f4"),fillColor:this._themeColor("--card-background-color","#ffffff"),fillOpacity:1,interactive:!1}).addTo(this._baseLayer)}_fitToArea(t){const e=this._bounds();if(!e)return;t.leafletMap?.invalidateSize(!1);const i=this._config?.zoom_offset??wt;t.fitBounds(function(t){return[[t.north,t.west],[t.south,t.east]]}(e),{pad:Ft(.05,i)});const r=this._config?.zoom;void 0!==r&&(t.zoom=r)}_renderMap(){const t=`--fmc-map-height:${this._config?.map_height??bt}px`;return null===this._mapAvailable?V`<div class="placeholder" style=${t}>Loading map…</div>`:this._mapAvailable?V`
      <div class="map-wrap" style=${t}>
        <ha-map .autoFit=${!1} .themeMode=${this._config?.theme_mode??At}></ha-map>
        <button class="recentre" title="Recentre on the watched area" @click=${this._onRecentre}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${"M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z"}></path></svg>
        </button>
      </div>
    `:V`<div class="placeholder error" style=${t}>
        Map unavailable — Home Assistant's map component did not load.
      </div>`}_renderDetail(){const t=this._selectedId,e=t?this._flights().find(e=>e.id===t):void 0;return e&&this._config?le(e,this._config,this._hour12()):V`<div class="detail empty">Tap an aircraft on the map</div>`}_hour12(){const t=this._hass?.locale?.time_format;if("24"===t)return!1;if("12"===t)return!0;try{return Intl.DateTimeFormat(void 0,{hour:"numeric"}).resolvedOptions().hour12??!0}catch{return!0}}render(){const t=this._config;if(!t)return q;const e=this._entity(),i=this._flights().length;return V`
      <ha-card>
        <div class="header">
          <div class="title">${this._title(e)}</div>
          ${e?V`<div class="count">${i} aircraft</div>`:q}
        </div>
        ${e?V`${this._renderMap()}${this._renderDetail()}`:V`<div class="body error">Entity <code>${t.entity}</code> not found.</div>`}
      </ha-card>
    `}}t([ut()],fe.prototype,"_config",void 0),t([ut()],fe.prototype,"_mapAvailable",void 0),t([ut()],fe.prototype,"_selectedId",void 0),customElements.get(ft)||customElements.define(ft,fe);const _e={entity:"Flightradar24 area sensor",title:"Title",map_height:"Map height",zoom:"Fixed zoom (overrides the area fit)",zoom_offset:"Zoom in beyond the area fit (levels)",theme_mode:"Map theme",icon_size:"Aircraft icon size",show_tracks:"Show tracks",show_area_center:"Mark the area centre",show_photo:"Show aircraft photo",unit_altitude:"Altitude",unit_speed:"Speed",unit_distance:"Distance"},ge=[{name:"entity",required:!0,selector:{entity:{domain:"sensor"}}},{name:"title",selector:{text:{}}},{type:"grid",name:"",schema:[{name:"map_height",selector:{number:{min:120,max:1200,step:10,mode:"box",unit_of_measurement:"px"}}},{name:"zoom",selector:{number:{min:1,max:20,step:1,mode:"box"}}},{name:"zoom_offset",selector:{number:{min:-2,max:3,step:1,mode:"box"}}},{name:"theme_mode",selector:{select:{mode:"dropdown",options:[...yt]}}},{name:"icon_size",selector:{number:{min:12,max:72,step:1,mode:"box",unit_of_measurement:"px"}}}]},{type:"grid",name:"",schema:[{name:"unit_altitude",selector:{select:{mode:"dropdown",options:[{value:"ft",label:"Feet"},{value:"m",label:"Metres"}]}}},{name:"unit_speed",selector:{select:{mode:"dropdown",options:[{value:"mph",label:"mph"},{value:"kts",label:"Knots"},{value:"kmh",label:"km/h"}]}}},{name:"unit_distance",selector:{select:{mode:"dropdown",options:[{value:"mi",label:"Miles"},{value:"km",label:"Kilometres"},{value:"nm",label:"Nautical miles"}]}}}]},{type:"grid",name:"",schema:[{name:"show_tracks",selector:{boolean:{}}},{name:"show_area_center",selector:{boolean:{}}},{name:"show_photo",selector:{boolean:{}}}]}];class ye extends at{constructor(){super(...arguments),this._computeLabel=t=>_e[t.name]??t.name,this._valueChanged=t=>{const e=t.detail.value,i={...this._config,...e},r={};for(const t of["altitude","speed","distance"]){const s=e[`unit_${t}`];"string"==typeof s&&""!==s&&(r[t]=s),delete i[`unit_${t}`]}Object.keys(r).length?i.units=r:delete i.units;for(const[t,e]of Object.entries(i))void 0!==e&&""!==e||delete i[t];this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}}static{this.styles=o`
    .hint {
      margin: 12px 4px 0;
      font-size: 0.8rem;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }
  `}setConfig(t){this._config=t}connectedCallback(){super.connectedCallback(),this._ensureForm()}async _ensureForm(){if(customElements.get("ha-form"))return;const t=await(window.loadCardHelpers?.());if(!t)return;const e=await t.createCardElement({type:"entities",entities:[]});await(e?.constructor?.getConfigElement?.()),this.requestUpdate()}render(){if(!this._config||!this.hass)return q;const t={...this._config,unit_altitude:this._config.units?.altitude,unit_speed:this._config.units?.speed,unit_distance:this._config.units?.distance};return delete t.units,V`
      <ha-form
        .hass=${this.hass}
        .data=${t}
        .schema=${ge}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <p class="hint">
        Defaults: ${bt} px tall, fitted ${wt} zoom level beyond the
        watched area, ${"tracks, centre mark and photo all on"}. An option left blank follows the default rather than being
        written into the dashboard. A positive zoom-in crops the area, so set it to 0 to see all of it.
      </p>
    `}}t([dt({attribute:!1})],ye.prototype,"hass",void 0),t([ut()],ye.prototype,"_config",void 0),customElements.get(_t)||customElements.define(_t,ye);var $e=Object.freeze({__proto__:null,FlightMapCardEditor:ye});export{fe as FlightMapCard};
