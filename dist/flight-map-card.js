function t(t,e,i,s){var r,o=arguments.length,n=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(n=(o<3?r(n):o>3?r(e,i,n):r(e,i))||n);return o>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new o(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:l,defineProperty:c,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,m=globalThis,f=m.trustedTypes,_=f?f.emptyScript:"",g=m.reactiveElementPolyfillSupport,y=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},v=(t,e)=>!l(t,e),b={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&c(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const o=s?.call(this);r?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...u(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:$).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=s;const o=r.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const o=this.constructor;if(!1===s&&(r=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??v)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==r||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[y("elementProperties")]=new Map,w[y("finalized")]=new Map,g?.({ReactiveElement:w}),(m.reactiveElementVersions??=[]).push("2.1.2");const A=globalThis,x=t=>t,M=A.trustedTypes,k=M?M.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,S="?"+E,P=`<${S}>`,z=document,T=()=>z.createComment(""),N=t=>null===t||"object"!=typeof t&&"function"!=typeof t,U=Array.isArray,L="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,R=/>/g,H=RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,F=/"/g,j=/^(?:script|style|textarea|title)$/i,B=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),V=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),q=new WeakMap,K=z.createTreeWalker(z,129);function G(t,e){if(!U(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(e):e}const J=(t,e)=>{const i=t.length-1,s=[];let r,o=2===e?"<svg>":3===e?"<math>":"",n=O;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,h=0;for(;h<i.length&&(n.lastIndex=h,l=n.exec(i),null!==l);)h=n.lastIndex,n===O?"!--"===l[1]?n=I:void 0!==l[1]?n=R:void 0!==l[2]?(j.test(l[2])&&(r=RegExp("</"+l[2],"g")),n=H):void 0!==l[3]&&(n=H):n===H?">"===l[0]?(n=r??O,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?H:'"'===l[3]?F:D):n===F||n===D?n=H:n===I||n===R?n=O:(n=H,r=void 0);const d=n===H&&t[e+1].startsWith("/>")?" ":"";o+=n===O?i+P:c>=0?(s.push(a),i.slice(0,c)+C+i.slice(c)+E+d):i+E+(-2===c?e:d)}return[G(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Z{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0;const n=t.length-1,a=this.parts,[l,c]=J(t,e);if(this.el=Z.createElement(l,i),K.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=K.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(C)){const e=c[o++],i=s.getAttribute(t).split(E),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:n[2],strings:i,ctor:"."===n[1]?et:"?"===n[1]?it:"@"===n[1]?st:tt}),s.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:r}),s.removeAttribute(t));if(j.test(s.tagName)){const t=s.textContent.split(E),e=t.length-1;if(e>0){s.textContent=M?M.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],T()),K.nextNode(),a.push({type:2,index:++r});s.append(t[e],T())}}}else if(8===s.nodeType)if(s.data===S)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(E,t+1));)a.push({type:7,index:r}),t+=E.length-1}r++}}static createElement(t,e){const i=z.createElement("template");return i.innerHTML=t,i}}function Y(t,e,i=t,s){if(e===V)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const o=N(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=Y(t,r._$AS(t,e.values),r,s)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??z).importNode(e,!0);K.currentNode=s;let r=K.nextNode(),o=0,n=0,a=i[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new X(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new rt(r,this,t)),this._$AV.push(e),a=i[++n]}o!==a?.index&&(r=K.nextNode(),o++)}return K.currentNode=z,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Y(this,t,e),N(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>U(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&N(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Z.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Q(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new Z(t)),e}k(t){U(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new X(this.O(T()),this.O(T()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=x(t).nextSibling;x(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,s){const r=this.strings;let o=!1;if(void 0===r)t=Y(this,t,e,0),o=!N(t)||t!==this._$AH&&t!==V,o&&(this._$AH=t);else{const s=t;let n,a;for(t=r[0],n=0;n<r.length-1;n++)a=Y(this,s[i+n],e,n),a===V&&(a=this._$AH[n]),o||=!N(a)||a!==this._$AH[n],a===W?t=W:t!==W&&(t+=(a??"")+r[n+1]),this._$AH[n]=a}o&&!s&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class st extends tt{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=Y(this,t,e,0)??W)===V)return;const i=this._$AH,s=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==W&&(i===W||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Y(this,t)}}const ot=A.litHtmlPolyfillSupport;ot?.(Z,X),(A.litHtmlVersions??=[]).push("3.3.3");const nt=globalThis;let at=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new X(e.insertBefore(T(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};at._$litElement$=!0,at.finalized=!0,nt.litElementHydrateSupport?.({LitElement:at});const lt=nt.litElementPolyfillSupport;lt?.({LitElement:at}),(nt.litElementVersions??=[]).push("4.2.2");const ct={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:v},ht=(t=ct,e,i)=>{const{kind:s,metadata:r}=i;let o=globalThis.litPropertyMetadata.get(r);if(void 0===o&&globalThis.litPropertyMetadata.set(r,o=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,r,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];e.call(this,i),this.requestUpdate(s,r,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function dt(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function ut(t){return dt({...t,state:!0,attribute:!1})}const pt=new Set(["type","view_layout","layout_options","grid_options","visibility","card_mod"]),mt=new Set(["entity","title","map_height","zoom","zoom_offset","theme_mode","show_tracks","show_airports","show_area_center","show_photo","icon_size","motion","units"]),ft="flight-map-card",_t="flight-map-card-editor",gt={altitude:"ft",speed:"mph",distance:"mi"},yt=["auto","light","dark"],$t=["predicted","glide","none"],vt={altitude:["ft","m"],speed:["mph","kts","kmh"],distance:["mi","km","nm"]},bt={map_height:[120,1200],icon_size:[12,72],zoom:[1,20],zoom_offset:[-2,3]},wt=460,At=1,xt="auto",Mt=!1,kt=!0,Ct=!0,Et=!0,St=28,Pt="predicted";function zt(t){throw new Error(t)}function Tt(t){if(null==t||""===t)return null;const e=Number(t);return Number.isFinite(e)?e:null}function Nt(t){return"string"==typeof t?""===t.trim()?null:t:null}function Ut(t){if(!Array.isArray(t))return[];const e=[];for(const i of t){if(!Array.isArray(i)||i.length<2)continue;const t=Tt(i[0]),s=Tt(i[1]);null!==t&&null!==s&&(Math.abs(t)>90||Math.abs(s)>180||e.push([t,s]))}return e}function Lt(t){return Nt(t.id)??Nt(t.callsign)??Nt(t.aircraft_registration)??Nt(t.aircraft_icao_24bit)}function Ot(t){return 1===Number(t.on_ground)}const It=new Set(["C120","C140","C150","C152","C162","C170","C172","C175","C177","C180","C182","C185","C188","C190","C195","C205","C206","C207","C208","C210","C77R","C82R","C82T","C10T","P210","P28A","P28B","P28R","P28S","P28T","P32R","P32T","PA11","PA12","PA14","PA15","PA16","PA17","PA18","PA20","PA22","PA23","PA24","PA25","PA27","PA30","PA31","PA32","PA34","PA36","PA38","PA44","PA46","PAY1","PAY2","BE23","BE24","BE33","BE35","BE36","BE50","BE55","BE58","BE60","BE76","BE77","BE95","BE99","BE9L","BE20","SR20","SR22","S22T","DA20","DA40","DA42","DA62","M20P","M20T","M20J","AA1","AA5","TB20","TB21","TOBA","RV4","RV6","RV7","RV8","RV9","RV10","RV12","BL8","CH7","J3","CUB","GLAS","LNC2","VELO","C303","C310","C337","C402","C404","C414","C421","AC11","AC50","GA8"]);function Rt(t){if(function(t){return"helicopter"===(t.aircraft_category??"").toLowerCase()}(t))return"helicopter";const e=(t.aircraft_code??"").trim().toUpperCase();return e&&It.has(e)?"light":"jet"}function Ht(t){const e=t.heading_display??t.heading,i=null==e?0:Math.round(e)%360;return`${Rt(t)[0]}|${i}|${Ot(t)?"g":"a"}`}function Dt(t){const e=t.coordinates;if(!e.length)return"0";const i=e[0],s=e[e.length-1];return`${e.length}|${i[0]},${i[1]}|${s[0]},${s[1]}`}function Ft(t){if(!Array.isArray(t))return[];const e=new Set,i=[];for(const s of t){if(!s||"object"!=typeof s||Array.isArray(s))continue;const t=s,r=Lt(t);if(!r||e.has(r))continue;const o=Tt(t.latitude),n=Tt(t.longitude);null!==o&&null!==n&&(Math.abs(o)>90||Math.abs(n)>180||(e.add(r),i.push({...t,id:r,latitude:o,longitude:n,altitude:Tt(t.altitude),heading:Tt(t.heading),ground_speed:Tt(t.ground_speed),vertical_speed:Tt(t.vertical_speed),distance:Tt(t.distance),closest_distance:Tt(t.closest_distance),on_ground:Tt(t.on_ground),coordinates:Ut(t.coordinates)})))}return function(t){return[...t].sort((t,e)=>{const i=t.distance??Number.POSITIVE_INFINITY,s=e.distance??Number.POSITIVE_INFINITY;return i!==s?i-s:t.id<e.id?-1:t.id>e.id?1:0})}(i)}function jt(t){return new Map(t.map(t=>[t.id,t]))}function Bt(t){return t.callsign??t.flight_number??t.aircraft_registration??t.id}const Vt=6371.0088,Wt=Math.PI/180;function qt(t,e){const[i,s]=t,[r,o]=e,n=(r-i)*Wt,a=(o-s)*Wt,l=Math.sin(n/2)**2+Math.cos(i*Wt)*Math.cos(r*Wt)*Math.sin(a/2)**2;return 12742.0176*Math.asin(Math.min(1,Math.sqrt(l)))}function Kt(t,e,i){if(0===i)return t;const s=i/Vt,r=e*Wt,o=t[0]*Wt,n=t[1]*Wt,a=Math.sin(o),l=Math.cos(o),c=Math.sin(s),h=Math.cos(s),d=Math.asin(a*h+l*c*Math.cos(r)),u=n+Math.atan2(Math.sin(r)*c*l,h-a*Math.sin(d));return[d/Wt,(u/Wt+540)%360-180]}function Gt(t,e){return"number"!=typeof t||"number"!=typeof e?null:Number.isFinite(t)&&Number.isFinite(e)?0===t&&0===e?null:[t,e]:null}function Jt(t,e){return 0===e?t:((1+2*t)*2**-e-1)/2}function Zt(t,e,i,s){return qt(t,e)<s?i:function(t,e){const i=Math.PI/180,s=t[0]*i,r=e[0]*i,o=(e[1]-t[1])*i,n=Math.sin(o)*Math.cos(r),a=Math.cos(s)*Math.sin(r)-Math.sin(s)*Math.cos(r)*Math.cos(o);return(Math.atan2(n,a)/i+360)%360}(t,e)}let Yt;let Qt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const Xt={},te=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends Qt{constructor(){super(...arguments),this.key=W}render(t,e){return this.key=t,e}update(t,[e,i]){return e!==this.key&&(((t,e=Xt)=>{t._$AH=e})(t),this.key=e),i}}),ee=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];function ie(t){return"number"==typeof t&&Number.isFinite(t)}function se(t,e=0){const i=Math.abs(t).toFixed(e),[s,r]=i.split("."),o=(s??"0").replace(/\B(?=(\d{3})+(?!\d))/g,","),n=t<0?"-":"";return r?`${n}${o}.${r}`:`${n}${o}`}function re(t,e){return ie(t)?"km"===e?`${se(t,1)} km`:"nm"===e?`${se(.539957*t,1)} nm`:`${se(.621371*t,1)} mi`:null}function oe(t){if(!ie(t))return null;const e=Math.round((t%360+360)%360)%360;return`${String(e).padStart(3,"0")}° ${function(t){const e=(t%360+360)%360;return ee[Math.round(e/22.5)%16]}(e)}`}function ne(t){return"number"!=typeof t||!Number.isFinite(t)||t<=0?null:t}function ae(t,e){return new Date(1e3*(t+e))}function le(t,e){const i=ae(t,e),s=String(i.getUTCMonth()+1).padStart(2,"0"),r=String(i.getUTCDate()).padStart(2,"0");return`${i.getUTCFullYear()}-${s}-${r}`}function ce(t,e,i,s){const r=ne(t);if(null===r)return null;if("number"!=typeof e||!Number.isFinite(e))return null;const o=ae(r,e),n=o.getUTCHours(),a=String(o.getUTCMinutes()).padStart(2,"0");return`${s?`${(n+11)%12+1}:${a} ${n<12?"AM":"PM"}`:`${String(n).padStart(2,"0")}:${a}`}${"string"==typeof i&&""!==i.trim()?` ${i.trim()}`:""}`}function he(t){const e=t.target?.closest("figure");e instanceof HTMLElement&&(e.style.display="none")}function de(t,e){return null===e?W:B`<div class="cell"><div class="k">${t}</div><div class="v">${e}</div></div>`}function ue(t){return t?B`<span class="chip">${t}</span>`:W}function pe(t){return t.callsign??t.flight_number??t.aircraft_registration??t.id}function me(t,e,i){const s=e?t.airport_destination_code_iata:t.airport_origin_code_iata;if(!s)return null;const r=e?t.airport_destination_timezone_offset:t.airport_origin_timezone_offset,o=e?t.airport_destination_timezone_abbr:t.airport_origin_timezone_abbr,n=ne(e?t.time_real_arrival:t.time_real_departure),a=ne(e?t.time_estimated_arrival:t.time_estimated_departure),l=ne(e?t.time_scheduled_arrival:t.time_scheduled_departure),c=n??a??l,h=n?e?"Arrived":"Departed":a?e?"Arrives (est)":"Departs (est)":e?"Arrives":"Departs";return{code:s,city:e?t.airport_destination_city:t.airport_origin_city,label:h,time:ce(c,r,o,i),scheduled:null!==l&&null!==c&&l!==c?ce(l,r,null,i):null,epoch:c,offset:"number"==typeof r?r:null}}function fe(t,e,i){return B`
    <div class="port ${i?"right":""}">
      <div class="iata">${t.code}</div>
      ${t.city?B`<div class="city">${t.city}</div>`:W}
      ${t.time?B`<div class="t-label">${t.label}</div>
            <div class="t-value">${t.time}${e?B`<sup class="day">${e}</sup>`:W}</div>`:W}
      ${t.scheduled?B`<div class="t-sched">sched ${t.scheduled}</div>`:W}
    </div>
  `}function _e(t,e,i){const s=me(t,!1,i),r=me(t,!0,i);if(!s||!r)return W;const o=function(t,e,i,s){const r=ne(t),o=ne(i);if(null===r||null===o)return 0;if("number"!=typeof e||"number"!=typeof s)return 0;const n=Date.parse(`${le(r,e)}T00:00:00Z`),a=Date.parse(`${le(o,s)}T00:00:00Z`);return Math.round((a-n)/864e5)}(s.epoch,s.offset,r.epoch,r.offset),n=o>0?`+${o}`:o<0?`${o}`:"",a=function(t,e,i){if(!t||!i)return null;const s=qt(t,e),r=qt(e,i),o=s+r;return o<=0?null:{flownKm:s,remainingKm:r,fraction:Math.min(1,Math.max(0,s/o))}}(Gt(t.airport_origin_latitude,t.airport_origin_longitude),[t.latitude,t.longitude],Gt(t.airport_destination_latitude,t.airport_destination_longitude)),l=a?function(t){if("number"!=typeof t||!Number.isFinite(t)||t<0)return null;const e=Math.round(t);if(e<1)return"< 1m";const i=Math.floor(e/60),s=e%60;return i?`${i}h ${String(s).padStart(2,"0")}m`:`${s}m`}(function(t,e,i,s){const r=ne(t);return null!==r&&r>s?(r-s)/60:"number"==typeof e&&Number.isFinite(e)&&"number"==typeof i&&Number.isFinite(i)&&i>0?.539957*e/i*60:null}(t.time_estimated_arrival??t.time_scheduled_arrival,a.remainingKm,t.ground_speed,Math.floor(Date.now()/1e3))):null,c=a?Math.floor(100*a.fraction):0;return B`
    <div class="route">
      <div class="leg">
        ${fe(s,"",!1)}
        <div class="arrow" aria-hidden="true">→</div>
        ${fe(r,n,!0)}
      </div>
      ${a?B`
            <div
              class="bar"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow=${c}
            >
              <div class="fill" style="width:${c}%"></div>
            </div>
            <div class="legend">
              <span>${re(a.flownKm,e.distance)} flown</span>
              <span>
                ${re(a.remainingKm,e.distance)} to run${l?` · ${l}`:""}
              </span>
            </div>
          `:W}
    </div>
  `}function ge(t,e,i){const s=e.units,r=e.show_photo?function(t){return t.aircraft_photo_medium??t.aircraft_photo_large??t.aircraft_photo_small}(t):null,o=function(t,e){const i=(t??"").trim(),s=(e??"").trim();return i&&s?`https://fr24.com/${encodeURIComponent(s)}/${encodeURIComponent(i)}`:s?`https://www.flightradar24.com/${encodeURIComponent(s)}`:i?`https://www.flightradar24.com/${encodeURIComponent(i)}`:null}(t.id,pe(t)),n=function(t){const e=t.airline_short??t.airline;return[t.aircraft_model,e].filter(t=>!!t).join(" · ")}(t);return B`
    <div class="detail">
      <div class="d-head">
        <div class="d-name">${pe(t)}</div>
        <div class="chips">${ue(t.aircraft_code)}${ue(t.aircraft_registration)}</div>
      </div>
      ${n?B`<div class="d-sub">${n}</div>`:W}
      ${r?te(r,B`<figure class="photo">
              <img src=${r} alt=${pe(t)} loading="lazy" @error=${he} />
            </figure>`):W}
      ${_e(t,s,i)}
      <div class="grid">
        ${de("Altitude",(l=t.altitude,c=s.altitude,ie(l)?"m"===c?`${se(.3048*l)} m`:`${se(l)} ft`:null))}
        ${de("Vertical",(a=t.vertical_speed,ie(a)?Math.abs(a)<50?"Level":`${a>0?"↑":"↓"} ${se(Math.abs(a))} ft/min`:null))}
        ${de("Ground speed",function(t,e){return ie(t)?"kts"===e?`${se(t)} kts`:"kmh"===e?`${se(1.852*t)} km/h`:`${se(1.15078*t)} mph`:null}(t.ground_speed,s.speed))}
        ${de("Track",oe(t.heading))}
        ${de("Distance",re(t.distance,s.distance))}
        ${de("Closest",re(t.closest_distance,s.distance))}
        ${de("Squawk",function(t){if("string"!=typeof t)return null;const e=t.trim();return""===e||"0000"===e?null:e}(t.squawk))}
        ${de("ICAO 24-bit",t.aircraft_icao_24bit)}
      </div>
      ${o?B`<a class="fr24" href=${o} target="_blank" rel="noopener noreferrer"
            >View on Flightradar24</a
          >`:W}
    </div>
  `;var a,l,c}function ye(t,e,i,s){e.style.zIndex=String(i),t.marker?.setZIndexOffset?.(s?1e3:0)}function $e(t){return t.replace(/["'<>]/g,"")}function ve(t,e){const i=null===t.heading?0:Math.round(t.heading),s=t.grounded,r=t.selected?e.selectedColor:s?e.groundColor:e.color,o="helicopter"===t.kind?function(t,e){const i=$e(e),s=$e(t.outline);return`<g stroke="${s}" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.9"><path d="M4.6 4.6 L19.4 19.4"></path><path d="M19.4 4.6 L4.6 19.4"></path></g><g stroke="${i}" stroke-width="1.1" stroke-linecap="round" fill="none"><path d="M4.6 4.6 L19.4 19.4"></path><path d="M19.4 4.6 L4.6 19.4"></path></g><rect x="11.1" y="12.4" width="1.8" height="8" rx="0.9" fill="${i}" stroke="${s}" stroke-width="1" paint-order="stroke"></rect><rect x="8.7" y="19.2" width="6.6" height="1.6" rx="0.8" fill="${i}" stroke="${s}" stroke-width="1" paint-order="stroke"></rect><ellipse cx="12" cy="10" rx="3.1" ry="4.3" fill="${i}" stroke="${s}" stroke-width="1.2" paint-order="stroke"></ellipse>`}(e,r):"light"===t.kind?function(t,e){const i=$e(e),s=$e(t.outline),r=`stroke="${s}" stroke-width="1" paint-order="stroke"`;return`<path d="M8.4 4.1 L15.6 4.1" stroke="${s}" stroke-width="2.6" stroke-linecap="round"></path><path d="M8.4 4.1 L15.6 4.1" stroke="${i}" stroke-width="1.2" stroke-linecap="round"></path><rect x="10.9" y="4.4" width="2.2" height="15.2" rx="1.1" fill="${i}" ${r}></rect><rect x="2.4" y="9.1" width="19.2" height="2.1" rx="1.05" fill="${i}" ${r}></rect><rect x="7.6" y="17.5" width="8.8" height="1.8" rx="0.9" fill="${i}" ${r}></rect>`}(e,r):function(t,e){return`<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="${$e(e)}" stroke="${$e(t.outline)}" stroke-width="1.4" stroke-linejoin="round" paint-order="stroke"></path>`}(e,r),n=(t.selected?`<circle cx="12" cy="12" r="11" fill="${$e(e.selectedColor)}" opacity="0.25"></circle>`:"")+o;return`<div style="width:${e.size}px;height:${e.size}px;transform:rotate(${i}deg);transform-origin:50% 50%;${s?"opacity:0.55;":""}"><svg viewBox="0 0 24 24" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${n}</svg></div>`}class be{constructor(){this._tracked=new Map,this._gapMs=45e3}setGapMs(t){Number.isFinite(t)&&t>0&&(this._gapMs=t)}gapMs(){return this._gapMs}has(t){return this._tracked.has(t)}forget(t){this._tracked.delete(t)}clear(){this._tracked.clear()}update(t,e,i,s){let r=0,o=0;this._tracked.has(t)&&void 0!==i&&void 0!==s&&(r=i-e.lat,o=s-e.lon,we(e.lat,r,o)>15&&(r=0,o=0)),this._tracked.set(t,{fix:e,residualLat:r,residualLon:o,residualAt:e.at,residualMs:this._residualMs(e,r,o)})}_residualMs(t,e,i){const s=t.grounded||null===t.speed||t.speed<=0?0:t.speed;if(0===s)return this._gapMs;const r=we(t.lat,e,i);if(0===r)return this._gapMs;const o=r/(.5*(1.852*s/36e5));return Math.min(Math.max(this._gapMs,o),12e4)}step(t,e){const i=this._tracked.get(t);if(!i)return null;const{fix:s}=i;let r=0,o=s.heading??0;if(!s.grounded&&null!==s.speed&&s.speed>0&&null!==s.heading){const t=Math.min(Math.max(0,e-s.at),12e4);r=1.852*s.speed*t/36e5,o=s.heading}const n=e-i.residualAt,a=i.residualMs>0?1-n/i.residualMs:0,l=a>0?Math.min(1,a):0;return{fromLat:s.lat,fromLon:s.lon,bearing:o,km:r,residualLat:l>0?i.residualLat*l:0,residualLon:l>0?i.residualLon*l:0}}}function we(t,e,i){const s=Math.PI/180,r=111.32*e,o=111.32*i*Math.cos(t*s);return Math.hypot(r,o)}function Ae(t,e){return{lat:t.latitude,lon:t.longitude,speed:t.ground_speed,heading:t.heading,grounded:Ot(t),at:e}}function xe(t,e){return t.length?t[Math.min(t.length-1,Math.floor(t.length*e))]:0}class Me{constructor(t,e,i){this._motion=new be,this._mode="predicted",this._items=new Map,this._flights=new Map,this._showTracks=!0,this._airports=[],this._airportKey="",this._centreKey="",this._pausedUntil=0,this._stats=!1,this._scriptSamples=[],this._intervalSamples=[],this._lastFrameAt=0,this.engine=t,this._view=e,this._onSelect=i}get kind(){return(t=this.engine)._maplibre?"maplibre":t.leafletMap?"leaflet":"unknown";var t}setGapMs(t){this._motion.setGapMs(t)}setMode(t,e=Date.now()){if(t!==this._mode){this._mode=t;for(const[i,s]of this._items){s.glide=void 0;const r=this._flights.get(i);r&&("predicted"===t?this._motion.update(i,Ae(r,e)):this._place(s,[r.latitude,r.longitude]))}"predicted"!==t&&this._motion.clear(),this._ensureLoop()}}sync(t,e,i,s,r=Date.now()){const o=void 0!==this._style&&!function(t,e){return t.size===e.size&&t.color===e.color&&t.outline===e.outline&&t.groundColor===e.groundColor&&t.selectedColor===e.selectedColor}(this._style,e),n=i!==this._showTracks;this._style=e,this._showTracks=i;const a=function(t,e){const i=[],s=[],r=new Set;for(const o of e){r.add(o.id);const e=t.get(o.id);if(!e){i.push(o);continue}const n=e.latitude!==o.latitude||e.longitude!==o.longitude,a=Ht(e)!==Ht(o),l=Dt(e)!==Dt(o);(n||a||l)&&s.push({flight:o,moved:n,restyled:a,retracked:l})}const o=[];for(const e of t.keys())r.has(e)||o.push(e);return{added:i,changed:s,removed:o}}(this._flights,t);for(const t of a.removed){const e=this._items.get(t);e?.handle.remove(),e?.track?.remove(),this._items.delete(t),this._motion.forget(t),this._selectedId===t&&(this._selectedId=void 0)}for(const t of a.added)this._add(t,e,r);for(const{flight:t,moved:e,restyled:i,retracked:l}of a.changed){const a=this._items.get(t.id);a&&(i&&!o&&this._paint(a,t),e&&this._moveTo(a,t,s,r),l&&!n&&this._drawTrack(a,t))}if(this._flights=jt(t),o||n)for(const[t,e]of this._items){const i=this._flights.get(t);i&&(o&&this._paint(e,i),(n||o)&&this._drawTrack(e,i))}this._ensureLoop()}select(t){const e=this._selectedId;this._selectedId=t;for(const i of new Set([e,t])){if(!i)continue;const t=this._items.get(i),e=this._flights.get(i);t&&e&&(this._paint(t,e),t.track?.remove(),t.track=void 0,this._drawTrack(t,e))}}positionOf(t){return this._items.get(t)?.at}syncAirports(t,e){const i=t.map(t=>t.code).join(",")+JSON.stringify(e);if(i!==this._airportKey){this._airportKey=i;for(const t of this._airports)t.handle.remove();this._airports=t.map(t=>{const i=function(t,e){const i=$e(e.color),s=$e(e.outline);return{size:[46,32],anchor:[23,9],html:`<div style="width:46px;display:flex;flex-direction:column;align-items:center;"><svg width="18" height="18" viewBox="0 0 24 24" style="display:block" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="${i}" stroke="${s}" stroke-width="2" paint-order="stroke" opacity="0.92"></rect><g stroke="${s}" stroke-width="2.1" stroke-linecap="round"><path d="M7.6 16.4 L16.4 7.6"></path><path d="M8.4 8.6 L15.4 15.6"></path></g></svg><span style="margin-top:1px;font-size:10px;font-weight:600;letter-spacing:0.3px;line-height:1;color:${$e(e.labelColor)};text-shadow:0 0 3px ${s},0 0 3px ${s};white-space:nowrap;">${t.replace(/[^A-Za-z0-9]/g,"").slice(0,4)}</span></div>`}}(t.code,e),s=document.createElement("div");s.innerHTML=i.html;const r=this.engine.addMarker(s,[t.latitude,t.longitude],{size:i.size,anchor:i.anchor,title:t.name??t.code,interactive:!1});return ye(r,s,0,!1),{handle:r}})}}setCentre(t,e,i){const s=t?`${t[0]},${t[1]},${e},${i}`:"";if(s===this._centreKey)return;if(this._centreKey=s,this._centre?.handle.remove(),this._centre=void 0,!t)return;const r=document.createElement("div");r.style.cssText=`width:10px;height:10px;box-sizing:border-box;border-radius:50%;border:2px solid ${e.replace(/[";<>]/g,"")};background:${i.replace(/[";<>]/g,"")};`;const o=this.engine.addMarker(r,t,{size:[10,10],interactive:!1});ye(o,r,0,!1),this._centre={handle:o,element:r}}pause(t){this._pausedUntil=Date.now()+t}resume(){this._pausedUntil=0}destroy(){for(const t of this._items.values())t.handle.remove(),t.track?.remove();for(const t of this._airports)t.handle.remove();this._centre?.handle.remove(),this.abandon()}abandon(){this._stop(),this._items.clear(),this._flights.clear(),this._motion.clear(),this._airports=[],this._airportKey="",this._centre=void 0,this._centreKey=""}enableStats(){this._stats=!0}takeStats(){const t=[...this._scriptSamples].sort((t,e)=>t-e),e=[...this._intervalSamples].sort((t,e)=>t-e),i=xe(e,.5);return this._scriptSamples=[],this._intervalSamples=[],{frames:t.length,scriptMs:{mean:t.reduce((t,e)=>t+e,0)/(t.length||1),p95:xe(t,.95),max:t[t.length-1]??0},intervalMs:{p50:i,p95:xe(e,.95),max:e[e.length-1]??0},longFrames:e.filter(t=>t>1.5*i).length}}_add(t,e,i){const s=t.id,r=document.createElement("div");r.style.cursor="pointer",r.addEventListener("click",t=>{t.stopPropagation(),this._onSelect(s)});const o=[t.latitude,t.longitude],n={element:r,handle:this.engine.addMarker(r,o,{size:[e.size,e.size],title:Bt(t)}),at:o};this._items.set(s,n),this._paint(n,t),"predicted"===this._mode&&this._motion.update(s,Ae(t,i)),this._drawTrack(n,t)}_paint(t,e){if(!this._style)return;const i=e.id===this._selectedId;t.element.innerHTML=ve(function(t,e){return{heading:t.heading_display??t.heading,kind:Rt(t),grounded:Ot(t),selected:e}}(e,i),this._style),ye(t.handle,t.element,i?2:1,i)}_moveTo(t,e,i,s){const r=[e.latitude,e.longitude];"predicted"===this._mode?this._motion.update(e.id,Ae(e,s),t.at[0],t.at[1]):"glide"===this._mode?t.glide={from:t.at,to:r,start:s,ms:i}:(t.glide=void 0,this._place(t,r))}_place(t,e){var i,s;t.at=e,i=t.handle,s=e,i.setLocation?i.setLocation(s):i.marker?.setLatLng(s)}_drawTrack(t,e){const i=e.coordinates;if(i.length<2||!this._showTracks||!this._style)return t.track?.remove(),void(t.track=void 0);const s=e.id===this._selectedId,r={color:s?this._style.selectedColor:this._style.color,segments:[{points:i,opacity:s?.9:.45}],markers:[]};t.track?t.track.update(r):t.track=this.engine.addPath(r)}_animating(){if(!this._items.size)return!1;if("predicted"===this._mode)return!0;if("glide"===this._mode)for(const t of this._items.values())if(t.glide)return!0;return!1}_ensureLoop(){if(void 0!==this._frame||!this._animating())return;this._lastFrameAt=0;const t=e=>{if(!this._animating())return void(this._frame=void 0);this._frame=requestAnimationFrame(t);const i=this._stats?performance.now():0;this._step(Date.now()),this._stats&&(this._scriptSamples.push(performance.now()-i),this._lastFrameAt&&this._intervalSamples.push(e-this._lastFrameAt),this._lastFrameAt=e)};this._frame=requestAnimationFrame(t)}_stop(){void 0!==this._frame&&cancelAnimationFrame(this._frame),this._frame=void 0}_step(t){if(t<this._pausedUntil)return;const e=this._view(),i=e?.25*(s=e.center[0],r=e.zoom,156543.034*Math.cos(s*Math.PI/180)/2**r/111320):0;var s,r;for(const[e,s]of this._items){let r;if("predicted"===this._mode){const i=this._motion.step(e,t);if(!i)continue;const[s,o]=Kt([i.fromLat,i.fromLon],i.bearing,i.km);r=[s+i.residualLat,o+i.residualLon]}else{const e=s.glide;if(!e)continue;const i=e.ms>0?Math.min(1,(t-e.start)/e.ms):1;if(r=[e.from[0]+(e.to[0]-e.from[0])*i,e.from[1]+(e.to[1]-e.from[1])*i],i>=1){s.glide=void 0,this._place(s,e.to);continue}}const o=r[0]-s.at[0],n=(r[1]-s.at[1])*Math.cos(r[0]*Math.PI/180);o*o+n*n<=i*i||this._place(s,r)}}}const ke=n`
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
   * particular: never set touch-action on or around the map. The map engine
   * manages its own touch handling, and "touch-action: none" is what cost the
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
    /* Leaflet's controls sit at 800 (MapLibre's far lower); clear both. */
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
`,Ce=new URL(import.meta.url).searchParams.get("v")??"dev";window.customCards=window.customCards??[],window.customCards.some(t=>t.type===ft)||(window.customCards.push({type:ft,name:"Flight Map Card",description:"Interactive map of the aircraft overhead; tap one for its full detail.",preview:!1,documentationURL:"https://github.com/johnbr/ha-flightradar-tracker"}),console.info(`%c FLIGHT-MAP-CARD %c ${Ce} `,"color:#fff;background:#1f2933;font-weight:700","color:#1f2933;background:#4fc3f7;font-weight:700"));class Ee extends at{constructor(){super(...arguments),this._signature="",this._mapAvailable=null,this._drawn=new Map,this._parsedFor="",this._parsed=[],this._syncing=!1,this._resync=!1,this._lastTickAt=0,this._glideMs=1e3,this._onRecentre=()=>{const t=this._mapEl();t&&this._fitToArea(t)}}static{this.styles=ke}set hass(t){this._hass=t;const e=this._computeSignature();if(e===this._signature)return;this._signature=e;const i=Date.now();this._lastTickAt&&(this._glideMs=Math.min(Math.max(i-this._lastTickAt,1e3),12e4),this._layer?.setGapMs(this._glideMs)),this._lastTickAt=i,this.requestUpdate()}get hass(){return this._hass}setConfig(t){this._config=function(t){const e={type:t.type,entity:t.entity,map_height:t.map_height??wt,show_tracks:t.show_tracks??Mt,show_airports:t.show_airports??kt,show_area_center:t.show_area_center??Ct,show_photo:t.show_photo??Et,icon_size:t.icon_size??St,zoom_offset:t.zoom_offset??At,theme_mode:t.theme_mode??xt,motion:t.motion??Pt,units:{...gt,...t.units}};return void 0!==t.title&&(e.title=t.title),void 0!==t.zoom&&(e.zoom=t.zoom),e}(function(t){t&&"object"==typeof t&&!Array.isArray(t)||zt("Invalid configuration");const e=t,i=[...mt].sort().join(", ");for(const t of Object.keys(e))pt.has(t)||mt.has(t)||zt(`Unknown option "${t}". Known options: ${i}`);const s=e.entity;"string"==typeof s&&""!==s.trim()||zt("`entity` is required: the Flightradar24 area sensor, e.g. sensor.flightradar24_current_in_area"),s.startsWith("sensor.")||zt(`\`entity\` must be a sensor, got "${s}"`);const r=e.title;void 0!==r&&"string"!=typeof r&&zt("`title` must be a string");const o={type:"string"==typeof e.type?e.type:`custom:${ft}`,entity:s.trim()};void 0!==r&&(o.title=r);for(const t of["map_height","icon_size","zoom","zoom_offset"]){const i=e[t];if(void 0===i)continue;const[s,r]=bt[t];"number"==typeof i&&Number.isFinite(i)||zt(`\`${t}\` must be a number`),(i<s||i>r)&&zt(`\`${t}\` must be between ${s} and ${r}, got ${i}`),"zoom_offset"!==t||Number.isInteger(i)||zt("`zoom_offset` must be a whole number of zoom levels"),o[t]=i}for(const t of["show_tracks","show_airports","show_area_center","show_photo"]){const i=e[t];void 0!==i&&("boolean"!=typeof i&&zt(`\`${t}\` must be true or false`),o[t]=i)}const n=e.theme_mode;void 0!==n&&("string"==typeof n&&yt.includes(n)||zt(`\`theme_mode\` must be one of ${yt.join(", ")}, got ${JSON.stringify(n)}`),o.theme_mode=n);const a=e.motion;void 0!==a&&("string"==typeof a&&$t.includes(a)||zt(`\`motion\` must be one of ${$t.join(", ")}, got ${JSON.stringify(a)}`),o.motion=a);const l=e.units;if(void 0!==l){l&&"object"==typeof l&&!Array.isArray(l)||zt("`units` must be a mapping");const t=l,e={};for(const[i,s]of Object.entries(t)){const t=vt[i];t||zt(`Unknown unit "${i}". Known units: ${Object.keys(vt).join(", ")}`),"string"==typeof s&&t.includes(s)||zt(`\`units.${i}\` must be one of ${t.join(", ")}, got ${JSON.stringify(s)}`),e[i]=s}o.units=e}return o}(t)),this._signature=this._computeSignature(),this._resetDrawing()}static async getConfigElement(){return await Promise.resolve().then(function(){return Te}),document.createElement(_t)}static getStubConfig(t,e){const i=["current_in_area","entered_area","exited_area","additional_tracked"],s=e.find(t=>t.startsWith("sensor.")&&i.some(e=>t.endsWith(e)))??e.find(t=>t.startsWith("sensor.")&&t.includes("flightradar"));return{type:`custom:${ft}`,entity:s??""}}getCardSize(){return 8}getGridOptions(){return{columns:12,min_columns:6,rows:"auto",min_rows:6}}connectedCallback(){super.connectedCallback(),null===this._mapAvailable&&async function(){return!!customElements.get("ha-map")||(Yt??=(async()=>{try{const t=await(window.loadCardHelpers?.());if(!t)return!1;await t.createCardElement({type:"map",show_all:!0})}catch{}return!!customElements.get("ha-map")||Promise.race([customElements.whenDefined("ha-map").then(()=>!0),new Promise(t=>setTimeout(()=>t(!1),1e4))])})(),Yt)}().then(t=>{this._mapAvailable=t}),this._engineWatch=window.setInterval(()=>{const t=this._mapEl()?._engine;this._layer&&t&&t!==this._layer.engine&&this._syncMap()},2e3),this._syncMap()}disconnectedCallback(){window.clearInterval(this._engineWatch),this._engineWatch=void 0,this._layer?.abandon(),this._layer=void 0,this._drawn.clear(),this._fittedEngine=void 0,super.disconnectedCallback()}updated(t){this._syncMap()}_resetDrawing(){this._layer?.destroy(),this._layer=void 0,this._drawn.clear()}_computeSignature(){const t=this._config?.entity;if(!t)return"";const e=this._hass?.states?.[t];return e?`${t}|${e.state}|${e.last_updated}`:`${t}|missing`}_entity(){const t=this._config?.entity;return t?this._hass?.states?.[t]:void 0}_flights(){return this._parsedFor!==this._signature&&(this._parsedFor=this._signature,this._parsed=Ft(this._entity()?.attributes?.flights)),this._parsed}_bounds(){return function(t){if("string"!=typeof t)return null;const e=t.split(",");if(4!==e.length)return null;const i=e.map(t=>Number(t.trim()));if(i.some(t=>!Number.isFinite(t)))return null;const[s,r,o,n]=i;return Math.abs(s)>90||Math.abs(r)>90||Math.abs(o)>180||Math.abs(n)>180?null:{north:Math.max(s,r),south:Math.min(s,r),west:o,east:n}}(this._entity()?.attributes?.bounds)}_title(t){if(void 0!==this._config?.title)return this._config.title;const e=t?.attributes?.friendly_name;return"string"==typeof e?e:"Flights overhead"}_mapEl(){return this.renderRoot?.querySelector("ha-map")??null}_themeColor(t,e){return getComputedStyle(this).getPropertyValue(t).trim()||e}async _syncMap(){if(!0!==this._mapAvailable)return;if(this._syncing)return void(this._resync=!0);const t=this._mapEl();if(t){this._syncing=!0;try{const e=await async function(t){const e=Date.now()+5e3;for(;(!t._loaded||!t._engine)&&Date.now()<e;)await new Promise(t=>setTimeout(t,50));return t._loaded?t._engine:void 0}(t);if(!e)return void(t._loaded&&console.error("flight-map-card: this Home Assistant's map has no engine API; the card needs 2026.10 or later"));if(this._layer?.engine!==e){this._layer?.abandon();const i=new Me(e,()=>t.getView(),t=>this._select(t));i.setGapMs(this._glideMs),"leaflet"===i.kind&&(e.leafletMap?.on("zoomstart",()=>i.pause(2e3)),e.leafletMap?.on("viewreset",()=>i.pause(2e3)),e.leafletMap?.on("zoomend",()=>i.resume())),this._layer=i,this._drawn.clear()}this._drawAreaCentre(),this._syncFlights(),this._fittedEngine!==e&&(this._fittedEngine=e,await t.updateComplete,this._fitToArea(t))}finally{this._syncing=!1,this._resync&&(this._resync=!1,this._syncMap())}}}_syncFlights(){const t=this._layer;if(!t)return;const e=this._flights(),i=this._motionMode();for(const t of e)t.heading_display=this._displayHeading(t,i);this._syncAirports(e),t.setMode(i),t.sync(e,this._iconStyle(),this._config?.show_tracks??Mt,this._glideMs),this._selectedId&&!e.some(t=>t.id===this._selectedId)&&(this._selectedId=void 0),this._drawn=jt(e)}_mapIsLight(){const t=this._config?.theme_mode??xt;return"auto"===t?null:"light"===t}_iconStyle(){const t=this._mapIsLight();return{size:this._config?.icon_size??St,color:null===t?this._themeColor("--primary-text-color","#212121"):t?"#212121":"#f5f5f5",outline:null===t?this._themeColor("--card-background-color","#ffffff"):t?"#ffffff":"#1c1c1c",groundColor:this._themeColor("--disabled-text-color","#8f8f8f"),selectedColor:this._themeColor("--primary-color","#03a9f4")}}_syncAirports(t){const e=this._layer;if(!e)return;const i=this._config?.show_airports??kt,s=this._mapIsLight(),r={color:null===s?this._themeColor("--secondary-text-color","#5c5c5c"):s?"#5c5c5c":"#c9c9c9",outline:null===s?this._themeColor("--card-background-color","#ffffff"):s?"#ffffff":"#1c1c1c",labelColor:null===s?this._themeColor("--secondary-text-color","#5c5c5c"):s?"#3c3c3c":"#e0e0e0"};e.syncAirports(i?function(t,e){const i=new Map;for(const s of t)for(const t of["origin","destination"]){const r=s[`airport_${t}_code_iata`],o=s[`airport_${t}_latitude`],n=s[`airport_${t}_longitude`];if(r&&"number"==typeof o&&"number"==typeof n&&(0!==o||0!==n)){if(e){if(o>e.north||o<e.south)continue;if(n<e.west||n>e.east)continue}i.has(r)||i.set(r,{code:r,name:s[`airport_${t}_name`],latitude:o,longitude:n})}}return[...i.values()].sort((t,e)=>t.code.localeCompare(e.code))}(t,this._bounds()):[],r)}_select(t){const e=this._selectedId;if(this._selectedId=e===t?void 0:t,this._layer?.select(this._selectedId),void 0===this._selectedId)return;const i=this._drawn.get(t),s=this._layer?.positionOf(t)??(i?[i.latitude,i.longitude]:void 0);s&&this._mapEl()?.panTo(s)}_motionMode(){return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?"none":this._config?.motion??Pt}_displayHeading(t,e){if("predicted"===e)return t.heading;const i=this._drawn.get(t.id);return i?Zt([i.latitude,i.longitude],[t.latitude,t.longitude],t.heading,.15):t.heading}_drawAreaCentre(){const t=this._bounds(),e=!!t&&!!this._config?.show_area_center;this._layer?.setCentre(e?function(t){return[(t.north+t.south)/2,(t.west+t.east)/2]}(t):null,this._themeColor("--primary-color","#03a9f4"),this._themeColor("--card-background-color","#ffffff"))}_fitToArea(t){const e=this._bounds();if(!e)return;const i=this._config?.zoom_offset??At;t.fitBounds(function(t){return[[t.north,t.west],[t.south,t.east]]}(e),{pad:Jt(.05,i)});const s=this._config?.zoom;void 0!==s&&(t.zoom=s)}_renderMap(){const t=`--fmc-map-height:${this._config?.map_height??wt}px`;return null===this._mapAvailable?B`<div class="placeholder" style=${t}>Loading map…</div>`:this._mapAvailable?B`
      <div class="map-wrap" style=${t}>
        <ha-map .autoFit=${!1} .themeMode=${this._config?.theme_mode??xt}></ha-map>
        <button class="recentre" title="Recentre on the watched area" @click=${this._onRecentre}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${"M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z"}></path></svg>
        </button>
      </div>
    `:B`<div class="placeholder error" style=${t}>
        Map unavailable — Home Assistant's map component did not load.
      </div>`}_renderDetail(){const t=this._selectedId,e=t?this._flights().find(e=>e.id===t):void 0;return e&&this._config?ge(e,this._config,this._hour12()):B`<div class="detail empty">Tap an aircraft on the map</div>`}_hour12(){const t=this._hass?.locale?.time_format;if("24"===t)return!1;if("12"===t)return!0;try{return Intl.DateTimeFormat(void 0,{hour:"numeric"}).resolvedOptions().hour12??!0}catch{return!0}}render(){const t=this._config;if(!t)return W;const e=this._entity(),i=this._flights().length;return B`
      <ha-card>
        <div class="header">
          <div class="title">${this._title(e)}</div>
          ${e?B`<div class="count">${i} aircraft</div>`:W}
        </div>
        ${e?B`${this._renderMap()}${this._renderDetail()}`:B`<div class="body error">Entity <code>${t.entity}</code> not found.</div>`}
      </ha-card>
    `}}t([ut()],Ee.prototype,"_config",void 0),t([ut()],Ee.prototype,"_mapAvailable",void 0),t([ut()],Ee.prototype,"_selectedId",void 0),customElements.get(ft)||customElements.define(ft,Ee);const Se={entity:"Flightradar24 area sensor",title:"Title",map_height:"Map height",zoom:"Fixed zoom (overrides the area fit)",zoom_offset:"Zoom in beyond the area fit (levels)",theme_mode:"Map theme",motion:"Motion between fixes",icon_size:"Aircraft icon size",show_tracks:"Show tracks",show_airports:"Show airports",show_area_center:"Mark the area centre",show_photo:"Show aircraft photo",unit_altitude:"Altitude",unit_speed:"Speed",unit_distance:"Distance"},Pe=[{name:"entity",required:!0,selector:{entity:{domain:"sensor"}}},{name:"title",selector:{text:{}}},{type:"grid",name:"",schema:[{name:"map_height",selector:{number:{min:120,max:1200,step:10,mode:"box",unit_of_measurement:"px"}}},{name:"zoom",selector:{number:{min:1,max:20,step:1,mode:"box"}}},{name:"zoom_offset",selector:{number:{min:-2,max:3,step:1,mode:"box"}}},{name:"theme_mode",selector:{select:{mode:"dropdown",options:[...yt]}}},{name:"icon_size",selector:{number:{min:12,max:72,step:1,mode:"box",unit_of_measurement:"px"}}},{name:"motion",selector:{select:{mode:"dropdown",options:[...$t]}}}]},{type:"grid",name:"",schema:[{name:"unit_altitude",selector:{select:{mode:"dropdown",options:[{value:"ft",label:"Feet"},{value:"m",label:"Metres"}]}}},{name:"unit_speed",selector:{select:{mode:"dropdown",options:[{value:"mph",label:"mph"},{value:"kts",label:"Knots"},{value:"kmh",label:"km/h"}]}}},{name:"unit_distance",selector:{select:{mode:"dropdown",options:[{value:"mi",label:"Miles"},{value:"km",label:"Kilometres"},{value:"nm",label:"Nautical miles"}]}}}]},{type:"grid",name:"",schema:[{name:"show_tracks",selector:{boolean:{}}},{name:"show_airports",selector:{boolean:{}}},{name:"show_area_center",selector:{boolean:{}}},{name:"show_photo",selector:{boolean:{}}}]}];class ze extends at{constructor(){super(...arguments),this._computeLabel=t=>Se[t.name]??t.name,this._valueChanged=t=>{const e=t.detail.value,i={...this._config,...e},s={};for(const t of["altitude","speed","distance"]){const r=e[`unit_${t}`];"string"==typeof r&&""!==r&&(s[t]=r),delete i[`unit_${t}`]}Object.keys(s).length?i.units=s:delete i.units;for(const[t,e]of Object.entries(i))void 0!==e&&""!==e||delete i[t];this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}}static{this.styles=n`
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
        .schema=${Pe}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <p class="hint">
        Defaults: ${wt} px tall, fitted ${At} zoom level beyond the
        watched area, ${"tracks off, airports, centre mark and photo on"}. An option left blank follows the default rather than being
        written into the dashboard. A positive zoom-in crops the area, so set it to 0 to see all of it.
      </p>
    `}}t([dt({attribute:!1})],ze.prototype,"hass",void 0),t([ut()],ze.prototype,"_config",void 0),customElements.get(_t)||customElements.define(_t,ze);var Te=Object.freeze({__proto__:null,FlightMapCardEditor:ze});export{Ee as FlightMapCard};
