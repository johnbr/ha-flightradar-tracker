function t(t,e,i,r){var s,o=arguments.length,n=o<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,r);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(o<3?s(n):o>3?s(e,i,n):s(e,i))||n);return o>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),s=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,r)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[r+1],t[0]);return new o(i,t,r)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,r))(e)})(t):t,{is:c,defineProperty:l,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,m=globalThis,f=m.trustedTypes,_=f?f.emptyScript:"",g=m.reactiveElementPolyfillSupport,y=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},v=(t,e)=>!c(t,e),b={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(t,i,e);void 0!==r&&l(this.prototype,t,r)}}static getPropertyDescriptor(t,e,i){const{get:r,set:s}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:r,set(e){const o=r?.call(this);s?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...u(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,r)=>{if(i)t.adoptedStyleSheets=r.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of r){const r=document.createElement("style"),s=e.litNonce;void 0!==s&&r.setAttribute("nonce",s),r.textContent=i.cssText,t.appendChild(r)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,i);if(void 0!==r&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:$).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,r=i._$Eh.get(t);if(void 0!==r&&this._$Em!==r){const t=i.getPropertyOptions(r),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=r;const o=s.fromAttribute(e,t.type);this[r]=o??this._$Ej?.get(r)??o,this._$Em=null}}requestUpdate(t,e,i,r=!1,s){if(void 0!==t){const o=this.constructor;if(!1===r&&(s=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??v)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:r,wrapped:s},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==s||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===r&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,r=this[e];!0!==t||this._$AL.has(e)||void 0===r||this.C(e,void 0,i,r)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[y("elementProperties")]=new Map,w[y("finalized")]=new Map,g?.({ReactiveElement:w}),(m.reactiveElementVersions??=[]).push("2.1.2");const A=globalThis,x=t=>t,k=A.trustedTypes,M=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+S,T=`<${E}>`,P=document,L=()=>P.createComment(""),z=t=>null===t||"object"!=typeof t&&"function"!=typeof t,N=Array.isArray,U="[ \t\n\f\r]",I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,R=/>/g,H=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,j=/"/g,F=/^(?:script|style|textarea|title)$/i,B=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),V=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),K=new WeakMap,q=P.createTreeWalker(P,129);function G(t,e){if(!N(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==M?M.createHTML(e):e}const Z=(t,e)=>{const i=t.length-1,r=[];let s,o=2===e?"<svg>":3===e?"<math>":"",n=I;for(let e=0;e<i;e++){const i=t[e];let a,c,l=-1,h=0;for(;h<i.length&&(n.lastIndex=h,c=n.exec(i),null!==c);)h=n.lastIndex,n===I?"!--"===c[1]?n=O:void 0!==c[1]?n=R:void 0!==c[2]?(F.test(c[2])&&(s=RegExp("</"+c[2],"g")),n=H):void 0!==c[3]&&(n=H):n===H?">"===c[0]?(n=s??I,l=-1):void 0===c[1]?l=-2:(l=n.lastIndex-c[2].length,a=c[1],n=void 0===c[3]?H:'"'===c[3]?j:D):n===j||n===D?n=H:n===O||n===R?n=I:(n=H,s=void 0);const d=n===H&&t[e+1].startsWith("/>")?" ":"";o+=n===I?i+T:l>=0?(r.push(a),i.slice(0,l)+C+i.slice(l)+S+d):i+S+(-2===l?e:d)}return[G(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),r]};class J{constructor({strings:t,_$litType$:e},i){let r;this.parts=[];let s=0,o=0;const n=t.length-1,a=this.parts,[c,l]=Z(t,e);if(this.el=J.createElement(c,i),q.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(r=q.nextNode())&&a.length<n;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(C)){const e=l[o++],i=r.getAttribute(t).split(S),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:s,name:n[2],strings:i,ctor:"."===n[1]?et:"?"===n[1]?it:"@"===n[1]?rt:tt}),r.removeAttribute(t)}else t.startsWith(S)&&(a.push({type:6,index:s}),r.removeAttribute(t));if(F.test(r.tagName)){const t=r.textContent.split(S),e=t.length-1;if(e>0){r.textContent=k?k.emptyScript:"";for(let i=0;i<e;i++)r.append(t[i],L()),q.nextNode(),a.push({type:2,index:++s});r.append(t[e],L())}}}else if(8===r.nodeType)if(r.data===E)a.push({type:2,index:s});else{let t=-1;for(;-1!==(t=r.data.indexOf(S,t+1));)a.push({type:7,index:s}),t+=S.length-1}s++}}static createElement(t,e){const i=P.createElement("template");return i.innerHTML=t,i}}function Y(t,e,i=t,r){if(e===V)return e;let s=void 0!==r?i._$Co?.[r]:i._$Cl;const o=z(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),void 0===o?s=void 0:(s=new o(t),s._$AT(t,i,r)),void 0!==r?(i._$Co??=[])[r]=s:i._$Cl=s),void 0!==s&&(e=Y(t,s._$AS(t,e.values),s,r)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,r=(t?.creationScope??P).importNode(e,!0);q.currentNode=r;let s=q.nextNode(),o=0,n=0,a=i[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new X(s,s.nextSibling,this,t):1===a.type?e=new a.ctor(s,a.name,a.strings,this,t):6===a.type&&(e=new st(s,this,t)),this._$AV.push(e),a=i[++n]}o!==a?.index&&(s=q.nextNode(),o++)}return q.currentNode=P,r}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,r){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Y(this,t,e),z(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>N(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&z(this._$AH)?this._$AA.nextSibling.data=t:this.T(P.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,r="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(e);else{const t=new Q(r,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=K.get(t.strings);return void 0===e&&K.set(t.strings,e=new J(t)),e}k(t){N(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,r=0;for(const s of t)r===e.length?e.push(i=new X(this.O(L()),this.O(L()),this,this.options)):i=e[r],i._$AI(s),r++;r<e.length&&(this._$AR(i&&i._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=x(t).nextSibling;x(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,r,s){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,r){const s=this.strings;let o=!1;if(void 0===s)t=Y(this,t,e,0),o=!z(t)||t!==this._$AH&&t!==V,o&&(this._$AH=t);else{const r=t;let n,a;for(t=s[0],n=0;n<s.length-1;n++)a=Y(this,r[i+n],e,n),a===V&&(a=this._$AH[n]),o||=!z(a)||a!==this._$AH[n],a===W?t=W:t!==W&&(t+=(a??"")+s[n+1]),this._$AH[n]=a}o&&!r&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class rt extends tt{constructor(t,e,i,r,s){super(t,e,i,r,s),this.type=5}_$AI(t,e=this){if((t=Y(this,t,e,0)??W)===V)return;const i=this._$AH,r=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==W&&(i===W||r);r&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Y(this,t)}}const ot=A.litHtmlPolyfillSupport;ot?.(J,X),(A.litHtmlVersions??=[]).push("3.3.3");const nt=globalThis;let at=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const r=i?.renderBefore??e;let s=r._$litPart$;if(void 0===s){const t=i?.renderBefore??null;r._$litPart$=s=new X(e.insertBefore(L(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};at._$litElement$=!0,at.finalized=!0,nt.litElementHydrateSupport?.({LitElement:at});const ct=nt.litElementPolyfillSupport;ct?.({LitElement:at}),(nt.litElementVersions??=[]).push("4.2.2");const lt={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:v},ht=(t=lt,e,i)=>{const{kind:r,metadata:s}=i;let o=globalThis.litPropertyMetadata.get(s);if(void 0===o&&globalThis.litPropertyMetadata.set(s,o=new Map),"setter"===r&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),"accessor"===r){const{name:r}=i;return{set(i){const s=e.get.call(this);e.set.call(this,i),this.requestUpdate(r,s,t,!0,i)},init(e){return void 0!==e&&this.C(r,void 0,t,e),e}}}if("setter"===r){const{name:r}=i;return function(i){const s=this[r];e.call(this,i),this.requestUpdate(r,s,t,!0,i)}}throw Error("Unsupported decorator location: "+r)};function dt(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const r=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),r?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function ut(t){return dt({...t,state:!0,attribute:!1})}const pt=new Set(["type","view_layout","layout_options","grid_options","visibility","card_mod"]),mt=new Set(["entity","title","map_height","zoom","zoom_offset","theme_mode","show_tracks","show_airports","show_area_center","show_photo","icon_size","motion","units"]),ft="flight-map-card",_t="flight-map-card-editor",gt={altitude:"ft",speed:"mph",distance:"mi"},yt=["auto","light","dark"],$t=["predicted","glide","none"],vt={altitude:["ft","m"],speed:["mph","kts","kmh"],distance:["mi","km","nm"]},bt={map_height:[120,1200],icon_size:[12,72],zoom:[1,20],zoom_offset:[-2,3]},wt=460,At=1,xt="auto",kt=!1,Mt=!0,Ct=!0,St=!0,Et=28,Tt="predicted";function Pt(t){throw new Error(t)}function Lt(t){if(null==t||""===t)return null;const e=Number(t);return Number.isFinite(e)?e:null}function zt(t){return"string"==typeof t?""===t.trim()?null:t:null}function Nt(t){if(!Array.isArray(t))return[];const e=[];for(const i of t){if(!Array.isArray(i)||i.length<2)continue;const t=Lt(i[0]),r=Lt(i[1]);null!==t&&null!==r&&(Math.abs(t)>90||Math.abs(r)>180||e.push([t,r]))}return e}function Ut(t){return zt(t.id)??zt(t.callsign)??zt(t.aircraft_registration)??zt(t.aircraft_icao_24bit)}function It(t){return 1===Number(t.on_ground)}const Ot=new Set(["C120","C140","C150","C152","C162","C170","C172","C175","C177","C180","C182","C185","C188","C190","C195","C205","C206","C207","C208","C210","C77R","C82R","C82T","C10T","P210","P28A","P28B","P28R","P28S","P28T","P32R","P32T","PA11","PA12","PA14","PA15","PA16","PA17","PA18","PA20","PA22","PA23","PA24","PA25","PA27","PA30","PA31","PA32","PA34","PA36","PA38","PA44","PA46","PAY1","PAY2","BE23","BE24","BE33","BE35","BE36","BE50","BE55","BE58","BE60","BE76","BE77","BE95","BE99","BE9L","BE20","SR20","SR22","S22T","DA20","DA40","DA42","DA62","M20P","M20T","M20J","AA1","AA5","TB20","TB21","TOBA","RV4","RV6","RV7","RV8","RV9","RV10","RV12","BL8","CH7","J3","CUB","GLAS","LNC2","VELO","C303","C310","C337","C402","C404","C414","C421","AC11","AC50","GA8"]);function Rt(t){if(function(t){return"helicopter"===(t.aircraft_category??"").toLowerCase()}(t))return"helicopter";const e=(t.aircraft_code??"").trim().toUpperCase();return e&&Ot.has(e)?"light":"jet"}function Ht(t){const e=t.heading_display??t.heading,i=null==e?0:Math.round(e)%360;return`${Rt(t)[0]}|${i}|${It(t)?"g":"a"}`}function Dt(t){const e=t.coordinates;if(!e.length)return"0";const i=e[0],r=e[e.length-1];return`${e.length}|${i[0]},${i[1]}|${r[0]},${r[1]}`}function jt(t){if(!Array.isArray(t))return[];const e=new Set,i=[];for(const r of t){if(!r||"object"!=typeof r||Array.isArray(r))continue;const t=r,s=Ut(t);if(!s||e.has(s))continue;const o=Lt(t.latitude),n=Lt(t.longitude);null!==o&&null!==n&&(Math.abs(o)>90||Math.abs(n)>180||(e.add(s),i.push({...t,id:s,latitude:o,longitude:n,altitude:Lt(t.altitude),heading:Lt(t.heading),ground_speed:Lt(t.ground_speed),vertical_speed:Lt(t.vertical_speed),distance:Lt(t.distance),closest_distance:Lt(t.closest_distance),on_ground:Lt(t.on_ground),coordinates:Nt(t.coordinates)})))}return function(t){return[...t].sort((t,e)=>{const i=t.distance??Number.POSITIVE_INFINITY,r=e.distance??Number.POSITIVE_INFINITY;return i!==r?i-r:t.id<e.id?-1:t.id>e.id?1:0})}(i)}function Ft(t){return t.callsign??t.flight_number??t.aircraft_registration??t.id}const Bt=6371.0088,Vt=Math.PI/180;function Wt(t,e){const[i,r]=t,[s,o]=e,n=(s-i)*Vt,a=(o-r)*Vt,c=Math.sin(n/2)**2+Math.cos(i*Vt)*Math.cos(s*Vt)*Math.sin(a/2)**2;return 12742.0176*Math.asin(Math.min(1,Math.sqrt(c)))}function Kt(t,e,i){if(0===i)return t;const r=i/Bt,s=e*Vt,o=t[0]*Vt,n=t[1]*Vt,a=Math.sin(o),c=Math.cos(o),l=Math.sin(r),h=Math.cos(r),d=Math.asin(a*h+c*l*Math.cos(s)),u=n+Math.atan2(Math.sin(s)*l*c,h-a*Math.sin(d));return[d/Vt,(u/Vt+540)%360-180]}function qt(t,e){return"number"!=typeof t||"number"!=typeof e?null:Number.isFinite(t)&&Number.isFinite(e)?0===t&&0===e?null:[t,e]:null}function Gt(t,e){return 0===e?t:((1+2*t)*2**-e-1)/2}function Zt(t,e,i,r){return Wt(t,e)<r?i:function(t,e){const i=Math.PI/180,r=t[0]*i,s=e[0]*i,o=(e[1]-t[1])*i,n=Math.sin(o)*Math.cos(s),a=Math.cos(r)*Math.sin(s)-Math.sin(r)*Math.cos(s)*Math.cos(o);return(Math.atan2(n,a)/i+360)%360}(t,e)}let Jt;let Yt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const Qt={},Xt=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends Yt{constructor(){super(...arguments),this.key=W}render(t,e){return this.key=t,e}update(t,[e,i]){return e!==this.key&&(((t,e=Qt)=>{t._$AH=e})(t),this.key=e),i}}),te=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];function ee(t){return"number"==typeof t&&Number.isFinite(t)}function ie(t,e=0){const i=Math.abs(t).toFixed(e),[r,s]=i.split("."),o=(r??"0").replace(/\B(?=(\d{3})+(?!\d))/g,","),n=t<0?"-":"";return s?`${n}${o}.${s}`:`${n}${o}`}function re(t,e){return ee(t)?"km"===e?`${ie(t,1)} km`:"nm"===e?`${ie(.539957*t,1)} nm`:`${ie(.621371*t,1)} mi`:null}function se(t){if(!ee(t))return null;const e=Math.round((t%360+360)%360)%360;return`${String(e).padStart(3,"0")}° ${function(t){const e=(t%360+360)%360;return te[Math.round(e/22.5)%16]}(e)}`}function oe(t){return"number"!=typeof t||!Number.isFinite(t)||t<=0?null:t}function ne(t,e){return new Date(1e3*(t+e))}function ae(t,e){const i=ne(t,e),r=String(i.getUTCMonth()+1).padStart(2,"0"),s=String(i.getUTCDate()).padStart(2,"0");return`${i.getUTCFullYear()}-${r}-${s}`}function ce(t,e,i,r){const s=oe(t);if(null===s)return null;if("number"!=typeof e||!Number.isFinite(e))return null;const o=ne(s,e),n=o.getUTCHours(),a=String(o.getUTCMinutes()).padStart(2,"0");return`${r?`${(n+11)%12+1}:${a} ${n<12?"AM":"PM"}`:`${String(n).padStart(2,"0")}:${a}`}${"string"==typeof i&&""!==i.trim()?` ${i.trim()}`:""}`}function le(t){const e=t.target?.closest("figure");e instanceof HTMLElement&&(e.style.display="none")}function he(t,e){return null===e?W:B`<div class="cell"><div class="k">${t}</div><div class="v">${e}</div></div>`}function de(t){return t?B`<span class="chip">${t}</span>`:W}function ue(t){return t.callsign??t.flight_number??t.aircraft_registration??t.id}function pe(t,e,i){const r=e?t.airport_destination_code_iata:t.airport_origin_code_iata;if(!r)return null;const s=e?t.airport_destination_timezone_offset:t.airport_origin_timezone_offset,o=e?t.airport_destination_timezone_abbr:t.airport_origin_timezone_abbr,n=oe(e?t.time_real_arrival:t.time_real_departure),a=oe(e?t.time_estimated_arrival:t.time_estimated_departure),c=oe(e?t.time_scheduled_arrival:t.time_scheduled_departure),l=n??a??c,h=n?e?"Arrived":"Departed":a?e?"Arrives (est)":"Departs (est)":e?"Arrives":"Departs";return{code:r,city:e?t.airport_destination_city:t.airport_origin_city,label:h,time:ce(l,s,o,i),scheduled:null!==c&&null!==l&&c!==l?ce(c,s,null,i):null,epoch:l,offset:"number"==typeof s?s:null}}function me(t,e,i){return B`
    <div class="port ${i?"right":""}">
      <div class="iata">${t.code}</div>
      ${t.city?B`<div class="city">${t.city}</div>`:W}
      ${t.time?B`<div class="t-label">${t.label}</div>
            <div class="t-value">${t.time}${e?B`<sup class="day">${e}</sup>`:W}</div>`:W}
      ${t.scheduled?B`<div class="t-sched">sched ${t.scheduled}</div>`:W}
    </div>
  `}function fe(t,e,i){const r=pe(t,!1,i),s=pe(t,!0,i);if(!r||!s)return W;const o=function(t,e,i,r){const s=oe(t),o=oe(i);if(null===s||null===o)return 0;if("number"!=typeof e||"number"!=typeof r)return 0;const n=Date.parse(`${ae(s,e)}T00:00:00Z`),a=Date.parse(`${ae(o,r)}T00:00:00Z`);return Math.round((a-n)/864e5)}(r.epoch,r.offset,s.epoch,s.offset),n=o>0?`+${o}`:o<0?`${o}`:"",a=function(t,e,i){if(!t||!i)return null;const r=Wt(t,e),s=Wt(e,i),o=r+s;return o<=0?null:{flownKm:r,remainingKm:s,fraction:Math.min(1,Math.max(0,r/o))}}(qt(t.airport_origin_latitude,t.airport_origin_longitude),[t.latitude,t.longitude],qt(t.airport_destination_latitude,t.airport_destination_longitude)),c=a?function(t){if("number"!=typeof t||!Number.isFinite(t)||t<0)return null;const e=Math.round(t);if(e<1)return"< 1m";const i=Math.floor(e/60),r=e%60;return i?`${i}h ${String(r).padStart(2,"0")}m`:`${r}m`}(function(t,e,i,r){const s=oe(t);return null!==s&&s>r?(s-r)/60:"number"==typeof e&&Number.isFinite(e)&&"number"==typeof i&&Number.isFinite(i)&&i>0?.539957*e/i*60:null}(t.time_estimated_arrival??t.time_scheduled_arrival,a.remainingKm,t.ground_speed,Math.floor(Date.now()/1e3))):null,l=a?Math.floor(100*a.fraction):0;return B`
    <div class="route">
      <div class="leg">
        ${me(r,"",!1)}
        <div class="arrow" aria-hidden="true">→</div>
        ${me(s,n,!0)}
      </div>
      ${a?B`
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
              <span>${re(a.flownKm,e.distance)} flown</span>
              <span>
                ${re(a.remainingKm,e.distance)} to run${c?` · ${c}`:""}
              </span>
            </div>
          `:W}
    </div>
  `}function _e(t,e,i){const r=e.units,s=e.show_photo?function(t){return t.aircraft_photo_medium??t.aircraft_photo_large??t.aircraft_photo_small}(t):null,o=function(t,e){const i=(t??"").trim(),r=(e??"").trim();return i&&r?`https://fr24.com/${encodeURIComponent(r)}/${encodeURIComponent(i)}`:r?`https://www.flightradar24.com/${encodeURIComponent(r)}`:i?`https://www.flightradar24.com/${encodeURIComponent(i)}`:null}(t.id,ue(t)),n=function(t){const e=t.airline_short??t.airline;return[t.aircraft_model,e].filter(t=>!!t).join(" · ")}(t);return B`
    <div class="detail">
      <div class="d-head">
        <div class="d-name">${ue(t)}</div>
        <div class="chips">${de(t.aircraft_code)}${de(t.aircraft_registration)}</div>
      </div>
      ${n?B`<div class="d-sub">${n}</div>`:W}
      ${s?Xt(s,B`<figure class="photo">
              <img src=${s} alt=${ue(t)} loading="lazy" @error=${le} />
            </figure>`):W}
      ${fe(t,r,i)}
      <div class="grid">
        ${he("Altitude",(c=t.altitude,l=r.altitude,ee(c)?"m"===l?`${ie(.3048*c)} m`:`${ie(c)} ft`:null))}
        ${he("Vertical",(a=t.vertical_speed,ee(a)?Math.abs(a)<50?"Level":`${a>0?"↑":"↓"} ${ie(Math.abs(a))} ft/min`:null))}
        ${he("Ground speed",function(t,e){return ee(t)?"kts"===e?`${ie(t)} kts`:"kmh"===e?`${ie(1.852*t)} km/h`:`${ie(1.15078*t)} mph`:null}(t.ground_speed,r.speed))}
        ${he("Track",se(t.heading))}
        ${he("Distance",re(t.distance,r.distance))}
        ${he("Closest",re(t.closest_distance,r.distance))}
        ${he("Squawk",function(t){if("string"!=typeof t)return null;const e=t.trim();return""===e||"0000"===e?null:e}(t.squawk))}
        ${he("ICAO 24-bit",t.aircraft_icao_24bit)}
      </div>
      ${o?B`<a class="fr24" href=${o} target="_blank" rel="noopener noreferrer"
            >View on Flightradar24</a
          >`:W}
    </div>
  `;var a,c,l}class ge{constructor(){this._tracked=new Map,this._gapMs=45e3}setGapMs(t){Number.isFinite(t)&&t>0&&(this._gapMs=t)}gapMs(){return this._gapMs}has(t){return this._tracked.has(t)}forget(t){this._tracked.delete(t)}clear(){this._tracked.clear()}update(t,e,i,r){let s=0,o=0;this._tracked.has(t)&&void 0!==i&&void 0!==r&&(s=i-e.lat,o=r-e.lon,ye(e.lat,s,o)>15&&(s=0,o=0)),this._tracked.set(t,{fix:e,residualLat:s,residualLon:o,residualAt:e.at,residualMs:this._residualMs(e,s,o)})}_residualMs(t,e,i){const r=t.grounded||null===t.speed||t.speed<=0?0:t.speed;if(0===r)return this._gapMs;const s=ye(t.lat,e,i);if(0===s)return this._gapMs;const o=s/(.5*(1.852*r/36e5));return Math.min(Math.max(this._gapMs,o),12e4)}step(t,e){const i=this._tracked.get(t);if(!i)return null;const{fix:r}=i;let s=0,o=r.heading??0;if(!r.grounded&&null!==r.speed&&r.speed>0&&null!==r.heading){const t=Math.min(Math.max(0,e-r.at),12e4);s=1.852*r.speed*t/36e5,o=r.heading}const n=e-i.residualAt,a=i.residualMs>0?1-n/i.residualMs:0,c=a>0?Math.min(1,a):0;return{fromLat:r.lat,fromLon:r.lon,bearing:o,km:s,residualLat:c>0?i.residualLat*c:0,residualLon:c>0?i.residualLon*c:0}}}function ye(t,e,i){const r=Math.PI/180,s=111.32*e,o=111.32*i*Math.cos(t*r);return Math.hypot(s,o)}function $e(t){return t.replace(/["'<>]/g,"")}function ve(t,e,i){const r=null===e.heading?0:Math.round(e.heading),s=e.grounded,o=e.selected?i.selectedColor:s?i.groundColor:i.color,n="helicopter"===e.kind?function(t,e){const i=$e(e),r=$e(t.outline);return`<g stroke="${r}" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.9"><path d="M4.6 4.6 L19.4 19.4"></path><path d="M19.4 4.6 L4.6 19.4"></path></g><g stroke="${i}" stroke-width="1.1" stroke-linecap="round" fill="none"><path d="M4.6 4.6 L19.4 19.4"></path><path d="M19.4 4.6 L4.6 19.4"></path></g><rect x="11.1" y="12.4" width="1.8" height="8" rx="0.9" fill="${i}" stroke="${r}" stroke-width="1" paint-order="stroke"></rect><rect x="8.7" y="19.2" width="6.6" height="1.6" rx="0.8" fill="${i}" stroke="${r}" stroke-width="1" paint-order="stroke"></rect><ellipse cx="12" cy="10" rx="3.1" ry="4.3" fill="${i}" stroke="${r}" stroke-width="1.2" paint-order="stroke"></ellipse>`}(i,o):"light"===e.kind?function(t,e){const i=$e(e),r=$e(t.outline),s=`stroke="${r}" stroke-width="1" paint-order="stroke"`;return`<path d="M8.4 4.1 L15.6 4.1" stroke="${r}" stroke-width="2.6" stroke-linecap="round"></path><path d="M8.4 4.1 L15.6 4.1" stroke="${i}" stroke-width="1.2" stroke-linecap="round"></path><rect x="10.9" y="4.4" width="2.2" height="15.2" rx="1.1" fill="${i}" ${s}></rect><rect x="2.4" y="9.1" width="19.2" height="2.1" rx="1.05" fill="${i}" ${s}></rect><rect x="7.6" y="17.5" width="8.8" height="1.8" rx="0.9" fill="${i}" ${s}></rect>`}(i,o):function(t,e){return`<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="${$e(e)}" stroke="${$e(t.outline)}" stroke-width="1.4" stroke-linejoin="round" paint-order="stroke"></path>`}(i,o),a=(e.selected?`<circle cx="12" cy="12" r="11" fill="${$e(i.selectedColor)}" opacity="0.25"></circle>`:"")+n,c=i.size/2;return t.divIcon({className:"fmc-aircraft",iconSize:[i.size,i.size],iconAnchor:[c,c],html:`<div style="width:${i.size}px;height:${i.size}px;transform:rotate(${r}deg);transform-origin:50% 50%;${s?"opacity:0.55;":""}"><svg viewBox="0 0 24 24" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${a}</svg></div>`})}function be(t,e,i){const r=$e(i.color),s=$e(i.outline),o=$e(i.labelColor),n=e.replace(/[^A-Za-z0-9]/g,"").slice(0,4);return t.divIcon({className:"fmc-airport",iconSize:[46,32],iconAnchor:[23,9],html:`<div style="width:46px;display:flex;flex-direction:column;align-items:center;"><svg width="18" height="18" viewBox="0 0 24 24" style="display:block" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="${r}" stroke="${s}" stroke-width="2" paint-order="stroke" opacity="0.92"></rect><g stroke="${s}" stroke-width="2.1" stroke-linecap="round"><path d="M7.6 16.4 L16.4 7.6"></path><path d="M8.4 8.6 L15.4 15.6"></path></g></svg><span style="margin-top:1px;font-size:10px;font-weight:600;letter-spacing:0.3px;line-height:1;color:${o};text-shadow:0 0 3px ${s},0 0 3px ${s};white-space:nowrap;">${n}</span></div>`})}const we=n`
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
`,Ae=new URL(import.meta.url).searchParams.get("v")??"dev",xe=1e3;function ke(t,e){return{heading:t.heading_display??t.heading,kind:Rt(t),grounded:It(t),selected:e}}function Me(t,e){return{lat:t.latitude,lon:t.longitude,speed:t.ground_speed,heading:t.heading,grounded:It(t),at:e}}window.customCards=window.customCards??[],window.customCards.some(t=>t.type===ft)||(window.customCards.push({type:ft,name:"Flight Map Card",description:"Interactive map of the aircraft overhead; tap one for its full detail.",preview:!1,documentationURL:"https://github.com/johnbr/ha-flightradar-tracker"}),console.info(`%c FLIGHT-MAP-CARD %c ${Ae} `,"color:#fff;background:#1f2933;font-weight:700","color:#1f2933;background:#4fc3f7;font-weight:700"));class Ce extends at{constructor(){super(...arguments),this._signature="",this._mapAvailable=null,this._airportKey="",this._markers=new Map,this._tracks=new Map,this._drawn=new Map,this._parsedFor="",this._parsed=[],this._fitted=!1,this._syncing=!1,this._resync=!1,this._lastTickAt=0,this._glideMs=1e3,this._gliding=[],this._motion=new ge,this._zoomingUntil=0,this._lastStepAt=0,this._onRecentre=()=>{const t=this._mapEl();t&&this._fitToArea(t)}}static{this.styles=we}set hass(t){this._hass=t;const e=this._computeSignature();if(e===this._signature)return;this._signature=e;const i=Date.now();this._lastTickAt&&(this._glideMs=Math.min(Math.max(i-this._lastTickAt,1e3),12e4),this._motion.setGapMs(this._glideMs)),this._lastTickAt=i,this.requestUpdate()}get hass(){return this._hass}setConfig(t){this._config=function(t){const e={type:t.type,entity:t.entity,map_height:t.map_height??wt,show_tracks:t.show_tracks??kt,show_airports:t.show_airports??Mt,show_area_center:t.show_area_center??Ct,show_photo:t.show_photo??St,icon_size:t.icon_size??Et,zoom_offset:t.zoom_offset??At,theme_mode:t.theme_mode??xt,motion:t.motion??Tt,units:{...gt,...t.units}};return void 0!==t.title&&(e.title=t.title),void 0!==t.zoom&&(e.zoom=t.zoom),e}(function(t){t&&"object"==typeof t&&!Array.isArray(t)||Pt("Invalid configuration");const e=t,i=[...mt].sort().join(", ");for(const t of Object.keys(e))pt.has(t)||mt.has(t)||Pt(`Unknown option "${t}". Known options: ${i}`);const r=e.entity;"string"==typeof r&&""!==r.trim()||Pt("`entity` is required: the Flightradar24 area sensor, e.g. sensor.flightradar24_current_in_area"),r.startsWith("sensor.")||Pt(`\`entity\` must be a sensor, got "${r}"`);const s=e.title;void 0!==s&&"string"!=typeof s&&Pt("`title` must be a string");const o={type:"string"==typeof e.type?e.type:`custom:${ft}`,entity:r.trim()};void 0!==s&&(o.title=s);for(const t of["map_height","icon_size","zoom","zoom_offset"]){const i=e[t];if(void 0===i)continue;const[r,s]=bt[t];"number"==typeof i&&Number.isFinite(i)||Pt(`\`${t}\` must be a number`),(i<r||i>s)&&Pt(`\`${t}\` must be between ${r} and ${s}, got ${i}`),"zoom_offset"!==t||Number.isInteger(i)||Pt("`zoom_offset` must be a whole number of zoom levels"),o[t]=i}for(const t of["show_tracks","show_airports","show_area_center","show_photo"]){const i=e[t];void 0!==i&&("boolean"!=typeof i&&Pt(`\`${t}\` must be true or false`),o[t]=i)}const n=e.theme_mode;void 0!==n&&("string"==typeof n&&yt.includes(n)||Pt(`\`theme_mode\` must be one of ${yt.join(", ")}, got ${JSON.stringify(n)}`),o.theme_mode=n);const a=e.motion;void 0!==a&&("string"==typeof a&&$t.includes(a)||Pt(`\`motion\` must be one of ${$t.join(", ")}, got ${JSON.stringify(a)}`),o.motion=a);const c=e.units;if(void 0!==c){c&&"object"==typeof c&&!Array.isArray(c)||Pt("`units` must be a mapping");const t=c,e={};for(const[i,r]of Object.entries(t)){const t=vt[i];t||Pt(`Unknown unit "${i}". Known units: ${Object.keys(vt).join(", ")}`),"string"==typeof r&&t.includes(r)||Pt(`\`units.${i}\` must be one of ${t.join(", ")}, got ${JSON.stringify(r)}`),e[i]=r}o.units=e}return o}(t)),this._signature=this._computeSignature(),this._resetDrawing()}static async getConfigElement(){return await Promise.resolve().then(function(){return Pe}),document.createElement(_t)}static getStubConfig(t,e){const i=["current_in_area","entered_area","exited_area","additional_tracked"],r=e.find(t=>t.startsWith("sensor.")&&i.some(e=>t.endsWith(e)))??e.find(t=>t.startsWith("sensor.")&&t.includes("flightradar"));return{type:`custom:${ft}`,entity:r??""}}getCardSize(){return 8}getGridOptions(){return{columns:12,min_columns:6,rows:"auto",min_rows:6}}connectedCallback(){super.connectedCallback(),null===this._mapAvailable&&async function(){return!!customElements.get("ha-map")||(Jt??=(async()=>{try{const t=await(window.loadCardHelpers?.());if(!t)return!1;await t.createCardElement({type:"map",show_all:!0})}catch{}return!!customElements.get("ha-map")||Promise.race([customElements.whenDefined("ha-map").then(()=>!0),new Promise(t=>setTimeout(()=>t(!1),1e4))])})(),Jt)}().then(t=>{this._mapAvailable=t}),this._syncMap()}disconnectedCallback(){this._endGlide(),this._stopMotion(),this._motion.clear(),this._mapInstance=void 0,this._baseLayer=void 0,this._trackLayer=void 0,this._markerLayer=void 0,this._airportLayer=void 0,this._airportKey="",this._centreMarker=void 0,this._markers.clear(),this._tracks.clear(),this._drawn.clear(),this._fitted=!1,super.disconnectedCallback()}updated(t){this._syncMap()}_resetDrawing(){this._endGlide(),this._stopMotion(),this._motion.clear(),this._baseLayer?.clearLayers(),this._trackLayer?.clearLayers(),this._markerLayer?.clearLayers(),this._airportLayer?.clearLayers(),this._airportKey="",this._centreMarker=void 0,this._markers.clear(),this._tracks.clear(),this._drawn.clear()}_computeSignature(){const t=this._config?.entity;if(!t)return"";const e=this._hass?.states?.[t];return e?`${t}|${e.state}|${e.last_updated}`:`${t}|missing`}_entity(){const t=this._config?.entity;return t?this._hass?.states?.[t]:void 0}_flights(){return this._parsedFor!==this._signature&&(this._parsedFor=this._signature,this._parsed=jt(this._entity()?.attributes?.flights)),this._parsed}_bounds(){return function(t){if("string"!=typeof t)return null;const e=t.split(",");if(4!==e.length)return null;const i=e.map(t=>Number(t.trim()));if(i.some(t=>!Number.isFinite(t)))return null;const[r,s,o,n]=i;return Math.abs(r)>90||Math.abs(s)>90||Math.abs(o)>180||Math.abs(n)>180?null:{north:Math.max(r,s),south:Math.min(r,s),west:o,east:n}}(this._entity()?.attributes?.bounds)}_title(t){if(void 0!==this._config?.title)return this._config.title;const e=t?.attributes?.friendly_name;return"string"==typeof e?e:"Flights overhead"}_mapEl(){return this.renderRoot?.querySelector("ha-map")??null}_themeColor(t,e){return getComputedStyle(this).getPropertyValue(t).trim()||e}async _syncMap(){if(!0!==this._mapAvailable)return;if(this._syncing)return void(this._resync=!0);const t=this._mapEl();if(t){this._syncing=!0;try{const e=await async function(t){const e=Date.now()+5e3;for(;(!t.Leaflet||!t._loaded)&&Date.now()<e;)await new Promise(t=>setTimeout(t,50));return t._loaded?t.Leaflet:void 0}(t),i=t.leafletMap;if(!e||!i)return;i!==this._mapInstance&&(this._mapInstance=i,i.on("zoomstart",()=>this._suspendForZoom()),i.on("zoomend",()=>{this._zoomingUntil=0}),this._baseLayer=e.layerGroup().addTo(i),this._airportLayer=e.layerGroup().addTo(i),this._trackLayer=e.layerGroup().addTo(i),this._markerLayer=e.layerGroup().addTo(i),this._centreMarker=void 0,this._markers.clear(),this._tracks.clear(),this._drawn.clear(),this._motion.clear(),this._fitted=!1),this._drawAreaCentre(e),this._syncFlights(e),"predicted"===this._motionMode()?this._startMotion():this._stopMotion(),this._fitted||(this._fitted=!0,await t.updateComplete,this._fitToArea(t))}finally{this._syncing=!1,this._resync&&(this._resync=!1,this._syncMap())}}}_syncFlights(t){const e=this._markerLayer,i=this._trackLayer;if(!e||!i)return;const r=this._flights(),s=this._motionMode();for(const t of r)t.heading_display=this._displayHeading(t,s);this._syncAirports(t,r);const o=function(t,e){const i=[],r=[],s=new Set;for(const o of e){s.add(o.id);const e=t.get(o.id);if(!e){i.push(o);continue}const n=e.latitude!==o.latitude||e.longitude!==o.longitude,a=Ht(e)!==Ht(o),c=Dt(e)!==Dt(o);(n||a||c)&&r.push({flight:o,moved:n,restyled:a,retracked:c})}const o=[];for(const e of t.keys())s.has(e)||o.push(e);return{added:i,changed:r,removed:o}}(this._drawn,r);if(!o.added.length&&!o.changed.length&&!o.removed.length)return;const n=this._iconStyle(),a=Date.now();for(const t of o.removed){const r=this._markers.get(t);r&&(e.removeLayer(r),this._markers.delete(t)),this._motion.forget(t);const s=this._tracks.get(t);s&&(i.removeLayer(s),this._tracks.delete(t)),this._selectedId===t&&(this._selectedId=void 0)}for(const i of o.added){const r=i.id,o=t.marker([i.latitude,i.longitude],{icon:ve(t,ke(i,r===this._selectedId),n),title:Ft(i),keyboard:!1});o.on("click",()=>this._select(r)),o.addTo(e),this._markers.set(r,o),"predicted"===s&&this._motion.update(r,Me(i,a)),this._drawTrack(t,i,n)}for(const{flight:e,moved:i,restyled:r,retracked:c}of o.changed){const o=this._markers.get(e.id);if(o&&(r&&o.setIcon(ve(t,ke(e,e.id===this._selectedId),n)),i))if("predicted"===s){const t=o.getLatLng();this._motion.update(e.id,Me(e,a),t.lat,t.lng)}else"glide"===s&&this._glide(o),o.setLatLng([e.latitude,e.longitude]);c&&this._drawTrack(t,e,n)}this._gliding.length&&(window.clearTimeout(this._glideTimer),this._glideTimer=window.setTimeout(()=>this._endGlide(),this._glideMs+200)),this._drawn=function(t){return new Map(t.map(t=>[t.id,t]))}(r)}_drawTrack(t,e,i){const r=this._trackLayer;if(!r)return;const s=e.coordinates,o=this._tracks.get(e.id);if(s.length<2||!this._config?.show_tracks)return void(o&&(r.removeLayer(o),this._tracks.delete(e.id)));if(o)return void o.setLatLngs(s);const n=e.id===this._selectedId,a=t.polyline(s,{...n?this._selectedTrackStyle(i):{color:i.color,weight:2,opacity:.45},lineJoin:"round",lineCap:"round",interactive:!1});a.addTo(r),this._tracks.set(e.id,a),n&&a.bringToFront()}_mapIsLight(){const t=this._config?.theme_mode??xt;return"auto"===t?null:"light"===t}_iconStyle(){const t=this._mapIsLight();return{size:this._config?.icon_size??Et,color:null===t?this._themeColor("--primary-text-color","#212121"):t?"#212121":"#f5f5f5",outline:null===t?this._themeColor("--card-background-color","#ffffff"):t?"#ffffff":"#1c1c1c",groundColor:this._themeColor("--disabled-text-color","#8f8f8f"),selectedColor:this._themeColor("--primary-color","#03a9f4")}}_syncAirports(t,e){const i=this._airportLayer;if(!i)return;if(!(this._config?.show_airports??Mt))return void(""!==this._airportKey&&(i.clearLayers(),this._airportKey=""));const r=function(t,e){const i=new Map;for(const r of t)for(const t of["origin","destination"]){const s=r[`airport_${t}_code_iata`],o=r[`airport_${t}_latitude`],n=r[`airport_${t}_longitude`];if(s&&"number"==typeof o&&"number"==typeof n&&(0!==o||0!==n)){if(e){if(o>e.north||o<e.south)continue;if(n<e.west||n>e.east)continue}i.has(s)||i.set(s,{code:s,name:r[`airport_${t}_name`],latitude:o,longitude:n})}}return[...i.values()].sort((t,e)=>t.code.localeCompare(e.code))}(e,this._bounds()),s=r.map(t=>t.code).join(",");if(s===this._airportKey)return;this._airportKey=s,i.clearLayers();const o=this._mapIsLight(),n={color:null===o?this._themeColor("--secondary-text-color","#5c5c5c"):o?"#5c5c5c":"#c9c9c9",outline:null===o?this._themeColor("--card-background-color","#ffffff"):o?"#ffffff":"#1c1c1c",labelColor:null===o?this._themeColor("--secondary-text-color","#5c5c5c"):o?"#3c3c3c":"#e0e0e0"};for(const e of r)t.marker([e.latitude,e.longitude],{icon:be(t,e.code,n),interactive:!1,keyboard:!1,title:e.name??e.code}).addTo(i)}_select(t){const e=this._selectedId;if(this._selectedId=e===t?void 0:t,this._paintSelection(e),void 0===this._selectedId)return;const i=this._markers.get(t),r=i?.getLatLng(),s=this._drawn.get(t),o=r?[r.lat,r.lng]:s?[s.latitude,s.longitude]:void 0;o&&this._mapInstance?.panTo(o,{animate:!0})}_paintSelection(t){const e=this._mapEl()?.Leaflet;if(!e)return;const i=this._iconStyle();if(t&&t!==this._selectedId){const r=this._drawn.get(t),s=this._markers.get(t);r&&s&&s.setIcon(ve(e,ke(r,!1),i)),this._tracks.get(t)?.setStyle({color:i.color,weight:2,opacity:.45})}const r=this._selectedId;if(!r)return;const s=this._drawn.get(r),o=this._markers.get(r);s&&o&&o.setIcon(ve(e,ke(s,!0),i)),this._tracks.get(r)?.setStyle(this._selectedTrackStyle(i)).bringToFront()}_glide(t){if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;const e=t.getElement();e&&(e.style.transition=`transform ${this._glideMs}ms linear`,this._gliding.push(e))}_endGlide(){void 0!==this._glideTimer&&(window.clearTimeout(this._glideTimer),this._glideTimer=void 0);for(const t of this._gliding)t.style.transition="";this._gliding=[]}_motionMode(){return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?"none":this._config?.motion??Tt}_displayHeading(t,e){if("predicted"===e)return t.heading;const i=this._drawn.get(t.id);return i?Zt([i.latitude,i.longitude],[t.latitude,t.longitude],t.heading,.15):t.heading}_startMotion(){void 0===this._motionTimer&&(this._lastStepAt=0,this._motionTimer=window.setInterval(()=>this._stepMotion(),xe))}_stopMotion(){if(void 0!==this._motionTimer){window.clearInterval(this._motionTimer),this._motionTimer=void 0;for(const t of this._markers.values()){const e=t.getElement();e&&(e.style.transition="")}}}_stepMotion(){const t=Date.now();if(t<this._zoomingUntil)return;if(document.hidden||!this._markers.size)return;const e=0!==this._lastStepAt&&t-this._lastStepAt>2e3;this._lastStepAt=t;const i=t+xe;for(const[t,r]of this._markers){const s=this._motion.step(t,i);if(!s)continue;const[o,n]=Kt([s.fromLat,s.fromLon],s.bearing,s.km),a=r.getElement();a&&(a.style.transition=e?"":"transform 1000ms linear"),r.setLatLng([o+s.residualLat,n+s.residualLon])}}_suspendForZoom(){this._zoomingUntil=Date.now()+2e3,this._endGlide();for(const t of this._markers.values()){const e=t.getElement();e&&(e.style.transition="")}}_selectedTrackStyle(t){return{color:t.selectedColor,weight:3,opacity:.9}}_drawAreaCentre(t){const e=this._bounds();if(!e||!this._baseLayer||!this._config?.show_area_center)return;const i=function(t){return[(t.north+t.south)/2,(t.west+t.east)/2]}(e);this._centreMarker?this._centreMarker.setLatLng(i):this._centreMarker=t.circleMarker(i,{radius:5,weight:2,color:this._themeColor("--primary-color","#03a9f4"),fillColor:this._themeColor("--card-background-color","#ffffff"),fillOpacity:1,interactive:!1}).addTo(this._baseLayer)}_fitToArea(t){const e=this._bounds();if(!e)return;t.leafletMap?.invalidateSize(!1);const i=this._config?.zoom_offset??At;t.fitBounds(function(t){return[[t.north,t.west],[t.south,t.east]]}(e),{pad:Gt(.05,i)});const r=this._config?.zoom;void 0!==r&&(t.zoom=r)}_renderMap(){const t=`--fmc-map-height:${this._config?.map_height??wt}px`;return null===this._mapAvailable?B`<div class="placeholder" style=${t}>Loading map…</div>`:this._mapAvailable?B`
      <div class="map-wrap" style=${t}>
        <ha-map .autoFit=${!1} .themeMode=${this._config?.theme_mode??xt}></ha-map>
        <button class="recentre" title="Recentre on the watched area" @click=${this._onRecentre}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${"M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z"}></path></svg>
        </button>
      </div>
    `:B`<div class="placeholder error" style=${t}>
        Map unavailable — Home Assistant's map component did not load.
      </div>`}_renderDetail(){const t=this._selectedId,e=t?this._flights().find(e=>e.id===t):void 0;return e&&this._config?_e(e,this._config,this._hour12()):B`<div class="detail empty">Tap an aircraft on the map</div>`}_hour12(){const t=this._hass?.locale?.time_format;if("24"===t)return!1;if("12"===t)return!0;try{return Intl.DateTimeFormat(void 0,{hour:"numeric"}).resolvedOptions().hour12??!0}catch{return!0}}render(){const t=this._config;if(!t)return W;const e=this._entity(),i=this._flights().length;return B`
      <ha-card>
        <div class="header">
          <div class="title">${this._title(e)}</div>
          ${e?B`<div class="count">${i} aircraft</div>`:W}
        </div>
        ${e?B`${this._renderMap()}${this._renderDetail()}`:B`<div class="body error">Entity <code>${t.entity}</code> not found.</div>`}
      </ha-card>
    `}}t([ut()],Ce.prototype,"_config",void 0),t([ut()],Ce.prototype,"_mapAvailable",void 0),t([ut()],Ce.prototype,"_selectedId",void 0),customElements.get(ft)||customElements.define(ft,Ce);const Se={entity:"Flightradar24 area sensor",title:"Title",map_height:"Map height",zoom:"Fixed zoom (overrides the area fit)",zoom_offset:"Zoom in beyond the area fit (levels)",theme_mode:"Map theme",motion:"Motion between fixes",icon_size:"Aircraft icon size",show_tracks:"Show tracks",show_airports:"Show airports",show_area_center:"Mark the area centre",show_photo:"Show aircraft photo",unit_altitude:"Altitude",unit_speed:"Speed",unit_distance:"Distance"},Ee=[{name:"entity",required:!0,selector:{entity:{domain:"sensor"}}},{name:"title",selector:{text:{}}},{type:"grid",name:"",schema:[{name:"map_height",selector:{number:{min:120,max:1200,step:10,mode:"box",unit_of_measurement:"px"}}},{name:"zoom",selector:{number:{min:1,max:20,step:1,mode:"box"}}},{name:"zoom_offset",selector:{number:{min:-2,max:3,step:1,mode:"box"}}},{name:"theme_mode",selector:{select:{mode:"dropdown",options:[...yt]}}},{name:"icon_size",selector:{number:{min:12,max:72,step:1,mode:"box",unit_of_measurement:"px"}}},{name:"motion",selector:{select:{mode:"dropdown",options:[...$t]}}}]},{type:"grid",name:"",schema:[{name:"unit_altitude",selector:{select:{mode:"dropdown",options:[{value:"ft",label:"Feet"},{value:"m",label:"Metres"}]}}},{name:"unit_speed",selector:{select:{mode:"dropdown",options:[{value:"mph",label:"mph"},{value:"kts",label:"Knots"},{value:"kmh",label:"km/h"}]}}},{name:"unit_distance",selector:{select:{mode:"dropdown",options:[{value:"mi",label:"Miles"},{value:"km",label:"Kilometres"},{value:"nm",label:"Nautical miles"}]}}}]},{type:"grid",name:"",schema:[{name:"show_tracks",selector:{boolean:{}}},{name:"show_airports",selector:{boolean:{}}},{name:"show_area_center",selector:{boolean:{}}},{name:"show_photo",selector:{boolean:{}}}]}];class Te extends at{constructor(){super(...arguments),this._computeLabel=t=>Se[t.name]??t.name,this._valueChanged=t=>{const e=t.detail.value,i={...this._config,...e},r={};for(const t of["altitude","speed","distance"]){const s=e[`unit_${t}`];"string"==typeof s&&""!==s&&(r[t]=s),delete i[`unit_${t}`]}Object.keys(r).length?i.units=r:delete i.units;for(const[t,e]of Object.entries(i))void 0!==e&&""!==e||delete i[t];this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}}static{this.styles=n`
    .hint {
      margin: 12px 4px 0;
      font-size: 0.8rem;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }
  `}setConfig(t){this._config=t}connectedCallback(){super.connectedCallback(),this._ensureForm()}async _ensureForm(){if(customElements.get("ha-form"))return;const t=await(window.loadCardHelpers?.());if(!t)return;const e=await t.createCardElement({type:"entities",entities:[]});await(e?.constructor?.getConfigElement?.()),this.requestUpdate()}render(){if(!this._config||!this.hass)return W;const t={...this._config,unit_altitude:this._config.units?.altitude,unit_speed:this._config.units?.speed,unit_distance:this._config.units?.distance};return delete t.units,B`
      <ha-form
        .hass=${this.hass}
        .data=${t}
        .schema=${Ee}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <p class="hint">
        Defaults: ${wt} px tall, fitted ${At} zoom level beyond the
        watched area, ${"tracks off, airports, centre mark and photo on"}. An option left blank follows the default rather than being
        written into the dashboard. A positive zoom-in crops the area, so set it to 0 to see all of it.
      </p>
    `}}t([dt({attribute:!1})],Te.prototype,"hass",void 0),t([ut()],Te.prototype,"_config",void 0),customElements.get(_t)||customElements.define(_t,Te);var Pe=Object.freeze({__proto__:null,FlightMapCardEditor:Te});export{Ce as FlightMapCard};
