function t(t,e,i,s){var r,n=arguments.length,o=n<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(n<3?r(o):n>3?r(e,i,o):r(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const o=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:a,defineProperty:c,getOwnPropertyDescriptor:l,getOwnPropertyNames:h,getOwnPropertySymbols:d,getPrototypeOf:u}=Object,p=globalThis,f=p.trustedTypes,_=f?f.emptyScript:"",g=p.reactiveElementPolyfillSupport,m=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!a(t,e),v={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),p.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=v){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&c(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const n=s?.call(this);r?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??v}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const t=this.properties,e=[...h(t),...d(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=s;const n=r.fromAttribute(e,t.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const n=this.constructor;if(!1===s&&(r=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??$)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==r||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[m("elementProperties")]=new Map,b[m("finalized")]=new Map,g?.({ReactiveElement:b}),(p.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,A=t=>t,x=w.trustedTypes,k=x?x.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+E,M=`<${C}>`,T=document,P=()=>T.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,N=Array.isArray,L="[ \t\n\f\r]",I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,H=/>/g,R=RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),z=/'/g,j=/"/g,D=/^(?:script|style|textarea|title)$/i,F=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),V=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),B=new WeakMap,q=T.createTreeWalker(T,129);function G(t,e){if(!N(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(e):e}const J=(t,e)=>{const i=t.length-1,s=[];let r,n=2===e?"<svg>":3===e?"<math>":"",o=I;for(let e=0;e<i;e++){const i=t[e];let a,c,l=-1,h=0;for(;h<i.length&&(o.lastIndex=h,c=o.exec(i),null!==c);)h=o.lastIndex,o===I?"!--"===c[1]?o=O:void 0!==c[1]?o=H:void 0!==c[2]?(D.test(c[2])&&(r=RegExp("</"+c[2],"g")),o=R):void 0!==c[3]&&(o=R):o===R?">"===c[0]?(o=r??I,l=-1):void 0===c[1]?l=-2:(l=o.lastIndex-c[2].length,a=c[1],o=void 0===c[3]?R:'"'===c[3]?j:z):o===j||o===z?o=R:o===O||o===H?o=I:(o=R,r=void 0);const d=o===R&&t[e+1].startsWith("/>")?" ":"";n+=o===I?i+M:l>=0?(s.push(a),i.slice(0,l)+S+i.slice(l)+E+d):i+E+(-2===l?e:d)}return[G(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class K{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,n=0;const o=t.length-1,a=this.parts,[c,l]=J(t,e);if(this.el=K.createElement(c,i),q.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=q.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(S)){const e=l[n++],i=s.getAttribute(t).split(E),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:o[2],strings:i,ctor:"."===o[1]?tt:"?"===o[1]?et:"@"===o[1]?it:X}),s.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:r}),s.removeAttribute(t));if(D.test(s.tagName)){const t=s.textContent.split(E),e=t.length-1;if(e>0){s.textContent=x?x.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],P()),q.nextNode(),a.push({type:2,index:++r});s.append(t[e],P())}}}else if(8===s.nodeType)if(s.data===C)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(E,t+1));)a.push({type:7,index:r}),t+=E.length-1}r++}}static createElement(t,e){const i=T.createElement("template");return i.innerHTML=t,i}}function Z(t,e,i=t,s){if(e===V)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const n=U(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=Z(t,r._$AS(t,e.values),r,s)),e}class Y{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??T).importNode(e,!0);q.currentNode=s;let r=q.nextNode(),n=0,o=0,a=i[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new Q(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new st(r,this,t)),this._$AV.push(e),a=i[++o]}n!==a?.index&&(r=q.nextNode(),n++)}return q.currentNode=T,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Z(this,t,e),U(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>N(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=K.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Y(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=B.get(t.strings);return void 0===e&&B.set(t.strings,e=new K(t)),e}k(t){N(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new Q(this.O(P()),this.O(P()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=A(t).nextSibling;A(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class X{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,s){const r=this.strings;let n=!1;if(void 0===r)t=Z(this,t,e,0),n=!U(t)||t!==this._$AH&&t!==V,n&&(this._$AH=t);else{const s=t;let o,a;for(t=r[0],o=0;o<r.length-1;o++)a=Z(this,s[i+o],e,o),a===V&&(a=this._$AH[o]),n||=!U(a)||a!==this._$AH[o],a===W?t=W:t!==W&&(t+=(a??"")+r[o+1]),this._$AH[o]=a}n&&!s&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class tt extends X{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class et extends X{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class it extends X{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??W)===V)return;const i=this._$AH,s=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==W&&(i===W||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}}const rt=w.litHtmlPolyfillSupport;rt?.(K,Q),(w.litHtmlVersions??=[]).push("3.3.3");const nt=globalThis;let ot=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new Q(e.insertBefore(P(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};ot._$litElement$=!0,ot.finalized=!0,nt.litElementHydrateSupport?.({LitElement:ot});const at=nt.litElementPolyfillSupport;at?.({LitElement:ot}),(nt.litElementVersions??=[]).push("4.2.2");const ct={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:$},lt=(t=ct,e,i)=>{const{kind:s,metadata:r}=i;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,r,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];e.call(this,i),this.requestUpdate(s,r,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function ht(t){return function(t){return(e,i)=>"object"==typeof i?lt(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}({...t,state:!0,attribute:!1})}const dt=new Set(["type","view_layout","layout_options","grid_options","visibility","card_mod"]),ut=new Set(["entity","title"]),pt="flight-map-card";function ft(t){throw new Error(t)}function _t(t){if(null==t||""===t)return null;const e=Number(t);return Number.isFinite(e)?e:null}function gt(t){return"string"==typeof t?""===t.trim()?null:t:null}function mt(t){if(!Array.isArray(t))return[];const e=[];for(const i of t){if(!Array.isArray(i)||i.length<2)continue;const t=_t(i[0]),s=_t(i[1]);null!==t&&null!==s&&(Math.abs(t)>90||Math.abs(s)>180||e.push([t,s]))}return e}function yt(t){return gt(t.id)??gt(t.callsign)??gt(t.aircraft_registration)??gt(t.aircraft_icao_24bit)}function $t(t){return"helicopter"===(t.aircraft_category??"").toLowerCase()}function vt(t){return 1===Number(t.on_ground)}function bt(t){const e=null===t.heading?0:Math.round(t.heading)%360;return`${$t(t)?"h":"p"}|${e}|${vt(t)?"g":"a"}`}function wt(t){const e=t.coordinates;if(!e.length)return"0";const i=e[0],s=e[e.length-1];return`${e.length}|${i[0]},${i[1]}|${s[0]},${s[1]}`}function At(t){if(!Array.isArray(t))return[];const e=new Set,i=[];for(const s of t){if(!s||"object"!=typeof s||Array.isArray(s))continue;const t=s,r=yt(t);if(!r||e.has(r))continue;const n=_t(t.latitude),o=_t(t.longitude);null!==n&&null!==o&&(Math.abs(n)>90||Math.abs(o)>180||(e.add(r),i.push({...t,id:r,latitude:n,longitude:o,altitude:_t(t.altitude),heading:_t(t.heading),ground_speed:_t(t.ground_speed),vertical_speed:_t(t.vertical_speed),distance:_t(t.distance),closest_distance:_t(t.closest_distance),on_ground:_t(t.on_ground),coordinates:mt(t.coordinates)})))}return function(t){return[...t].sort((t,e)=>{const i=t.distance??Number.POSITIVE_INFINITY,s=e.distance??Number.POSITIVE_INFINITY;return i!==s?i-s:t.id<e.id?-1:t.id>e.id?1:0})}(i)}function xt(t){return t.callsign??t.flight_number??t.aircraft_registration??t.id}let kt;let St=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const Et={},Ct=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends St{constructor(){super(...arguments),this.key=W}render(t,e){return this.key=t,e}update(t,[e,i]){return e!==this.key&&(((t,e=Et)=>{t._$AH=e})(t),this.key=e),i}}),Mt=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];function Tt(t){return"number"==typeof t&&Number.isFinite(t)}function Pt(t,e=0){const i=Math.abs(t).toFixed(e),[s,r]=i.split("."),n=(s??"0").replace(/\B(?=(\d{3})+(?!\d))/g,","),o=t<0?"-":"";return r?`${o}${n}.${r}`:`${o}${n}`}function Ut(t,e){return Tt(t)?`${Pt(.621371*t,1)} mi`:null}function Nt(t){if(!Tt(t))return null;const e=Math.round((t%360+360)%360)%360;return`${String(e).padStart(3,"0")}° ${function(t){const e=(t%360+360)%360;return Mt[Math.round(e/22.5)%16]}(e)}`}function Lt(t){const e=t.target?.closest("figure");e instanceof HTMLElement&&(e.style.display="none")}function It(t,e){return null===e?W:F`<div class="cell"><div class="k">${t}</div><div class="v">${e}</div></div>`}function Ot(t){return t?F`<span class="chip">${t}</span>`:W}function Ht(t){return t.callsign??t.flight_number??t.aircraft_registration??t.id}function Rt(t,e){const i=function(t){return t.aircraft_photo_medium??t.aircraft_photo_large??t.aircraft_photo_small}(t),s=function(t,e){const i=(t??"").trim(),s=(e??"").trim();return i&&s?`https://fr24.com/${encodeURIComponent(s)}/${encodeURIComponent(i)}`:s?`https://www.flightradar24.com/${encodeURIComponent(s)}`:i?`https://www.flightradar24.com/${encodeURIComponent(i)}`:null}(t.id,Ht(t)),r=function(t){const e=t.airline_short??t.airline;return[t.aircraft_model,e].filter(t=>!!t).join(" · ")}(t);return F`
    <div class="detail">
      <div class="d-head">
        <div class="d-name">${Ht(t)}</div>
        <div class="chips">${Ot(t.aircraft_code)}${Ot(t.aircraft_registration)}</div>
      </div>
      ${r?F`<div class="d-sub">${r}</div>`:W}
      ${i?Ct(i,F`<figure class="photo">
              <img src=${i} alt=${Ht(t)} loading="lazy" @error=${Lt} />
            </figure>`):W}
      <div class="grid">
        ${It("Altitude",(a=t.altitude,Tt(a)?`${Pt(a)} ft`:null))}
        ${It("Vertical",(o=t.vertical_speed,Tt(o)?Math.abs(o)<50?"Level":`${o>0?"↑":"↓"} ${Pt(Math.abs(o))} ft/min`:null))}
        ${It("Ground speed",(n=t.ground_speed,Tt(n)?`${Pt(1.15078*n)} mph`:null))}
        ${It("Track",Nt(t.heading))}
        ${It("Distance",Ut(t.distance))}
        ${It("Closest",Ut(t.closest_distance))}
        ${It("Squawk",function(t){if("string"!=typeof t)return null;const e=t.trim();return""===e||"0000"===e?null:e}(t.squawk))}
        ${It("ICAO 24-bit",t.aircraft_icao_24bit)}
      </div>
      ${s?F`<a class="fr24" href=${s} target="_blank" rel="noopener noreferrer"
            >View on Flightradar24</a
          >`:W}
    </div>
  `;var n,o,a}function zt(t){return t.replace(/["'<>]/g,"")}function jt(t,e,i){const s=null===e.heading?0:Math.round(e.heading),r=e.grounded,n=e.selected?i.selectedColor:r?i.groundColor:i.color,o=e.helicopter?function(t,e){const i=zt(e),s=zt(t.outline);return`<g stroke="${s}" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.9"><path d="M4.6 4.6 L19.4 19.4"></path><path d="M19.4 4.6 L4.6 19.4"></path></g><g stroke="${i}" stroke-width="1.1" stroke-linecap="round" fill="none"><path d="M4.6 4.6 L19.4 19.4"></path><path d="M19.4 4.6 L4.6 19.4"></path></g><rect x="11.1" y="12.4" width="1.8" height="8" rx="0.9" fill="${i}" stroke="${s}" stroke-width="1" paint-order="stroke"></rect><rect x="8.7" y="19.2" width="6.6" height="1.6" rx="0.8" fill="${i}" stroke="${s}" stroke-width="1" paint-order="stroke"></rect><ellipse cx="12" cy="10" rx="3.1" ry="4.3" fill="${i}" stroke="${s}" stroke-width="1.2" paint-order="stroke"></ellipse>`}(i,n):function(t,e){return`<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="${zt(e)}" stroke="${zt(t.outline)}" stroke-width="1.4" stroke-linejoin="round" paint-order="stroke"></path>`}(i,n),a=(e.selected?`<circle cx="12" cy="12" r="11" fill="${zt(i.selectedColor)}" opacity="0.25"></circle>`:"")+o,c=i.size/2;return t.divIcon({className:"fmc-aircraft",iconSize:[i.size,i.size],iconAnchor:[c,c],html:`<div style="width:${i.size}px;height:${i.size}px;transform:rotate(${s}deg);transform-origin:50% 50%;${r?"opacity:0.55;":""}"><svg viewBox="0 0 24 24" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${a}</svg></div>`})}const Dt=((t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new n(i,t,s)})`
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
  .map-wrap {
    position: relative;
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
`,Ft=new URL(import.meta.url).searchParams.get("v")??"dev";function Vt(t,e){return{heading:t.heading,helicopter:$t(t),grounded:vt(t),selected:e}}window.customCards=window.customCards??[],window.customCards.some(t=>t.type===pt)||(window.customCards.push({type:pt,name:"Flight Map Card",description:"Interactive map of the aircraft overhead; tap one for its full detail.",preview:!1,documentationURL:"https://github.com/johnbr/ha-flightradar-tracker"}),console.info(`%c FLIGHT-MAP-CARD %c ${Ft} `,"color:#fff;background:#1f2933;font-weight:700","color:#1f2933;background:#4fc3f7;font-weight:700"));class Wt extends ot{constructor(){super(...arguments),this._signature="",this._mapAvailable=null,this._markers=new Map,this._tracks=new Map,this._drawn=new Map,this._parsedFor="",this._parsed=[],this._fitted=!1,this._syncing=!1,this._resync=!1,this._lastTickAt=0,this._glideMs=1e3,this._gliding=[],this._onRecentre=()=>{const t=this._mapEl();t&&this._fitToArea(t)}}static{this.styles=Dt}set hass(t){this._hass=t;const e=this._computeSignature();if(e===this._signature)return;this._signature=e;const i=Date.now();this._lastTickAt&&(this._glideMs=Math.min(Math.max(i-this._lastTickAt,1e3),3e4)),this._lastTickAt=i,this.requestUpdate()}get hass(){return this._hass}setConfig(t){this._config=function(t){t&&"object"==typeof t&&!Array.isArray(t)||ft("Invalid configuration");const e=t,i=[...ut].sort().join(", ");for(const t of Object.keys(e))dt.has(t)||ut.has(t)||ft(`Unknown option "${t}". Known options: ${i}`);const s=e.entity;"string"==typeof s&&""!==s.trim()||ft("`entity` is required: the Flightradar24 area sensor, e.g. sensor.flightradar24_current_in_area"),s.startsWith("sensor.")||ft(`\`entity\` must be a sensor, got "${s}"`);const r=e.title;void 0!==r&&"string"!=typeof r&&ft("`title` must be a string");const n={type:"string"==typeof e.type?e.type:`custom:${pt}`,entity:s.trim()};return void 0!==r&&(n.title=r),n}(t),this._signature=this._computeSignature()}getCardSize(){return 8}connectedCallback(){super.connectedCallback(),null===this._mapAvailable&&async function(){return!!customElements.get("ha-map")||(kt??=(async()=>{try{const t=await(window.loadCardHelpers?.());if(!t)return!1;await t.createCardElement({type:"map",show_all:!0})}catch{}return!!customElements.get("ha-map")||Promise.race([customElements.whenDefined("ha-map").then(()=>!0),new Promise(t=>setTimeout(()=>t(!1),1e4))])})(),kt)}().then(t=>{this._mapAvailable=t}),this._syncMap()}disconnectedCallback(){this._endGlide(),this._mapInstance=void 0,this._baseLayer=void 0,this._trackLayer=void 0,this._markerLayer=void 0,this._centreMarker=void 0,this._markers.clear(),this._tracks.clear(),this._drawn.clear(),this._fitted=!1,super.disconnectedCallback()}updated(t){this._syncMap()}_computeSignature(){const t=this._config?.entity;if(!t)return"";const e=this._hass?.states?.[t];return e?`${t}|${e.state}|${e.last_updated}`:`${t}|missing`}_entity(){const t=this._config?.entity;return t?this._hass?.states?.[t]:void 0}_flights(){return this._parsedFor!==this._signature&&(this._parsedFor=this._signature,this._parsed=At(this._entity()?.attributes?.flights)),this._parsed}_bounds(){return function(t){if("string"!=typeof t)return null;const e=t.split(",");if(4!==e.length)return null;const i=e.map(t=>Number(t.trim()));if(i.some(t=>!Number.isFinite(t)))return null;const[s,r,n,o]=i;return Math.abs(s)>90||Math.abs(r)>90||Math.abs(n)>180||Math.abs(o)>180?null:{north:Math.max(s,r),south:Math.min(s,r),west:n,east:o}}(this._entity()?.attributes?.bounds)}_title(t){if(void 0!==this._config?.title)return this._config.title;const e=t?.attributes?.friendly_name;return"string"==typeof e?e:"Flights overhead"}_mapEl(){return this.renderRoot?.querySelector("ha-map")??null}_themeColor(t,e){return getComputedStyle(this).getPropertyValue(t).trim()||e}async _syncMap(){if(!0!==this._mapAvailable)return;if(this._syncing)return void(this._resync=!0);const t=this._mapEl();if(t){this._syncing=!0;try{const e=await async function(t){const e=Date.now()+5e3;for(;(!t.Leaflet||!t._loaded)&&Date.now()<e;)await new Promise(t=>setTimeout(t,50));return t._loaded?t.Leaflet:void 0}(t),i=t.leafletMap;if(!e||!i)return;i!==this._mapInstance&&(this._mapInstance=i,i.on("zoomstart",()=>this._endGlide()),this._baseLayer=e.layerGroup().addTo(i),this._trackLayer=e.layerGroup().addTo(i),this._markerLayer=e.layerGroup().addTo(i),this._centreMarker=void 0,this._markers.clear(),this._tracks.clear(),this._drawn.clear(),this._fitted=!1),this._drawAreaCentre(e),this._syncFlights(e),this._fitted||(this._fitted=!0,await t.updateComplete,this._fitToArea(t))}finally{this._syncing=!1,this._resync&&(this._resync=!1,this._syncMap())}}}_syncFlights(t){const e=this._markerLayer,i=this._trackLayer;if(!e||!i)return;const s=this._flights(),r=function(t,e){const i=[],s=[],r=new Set;for(const n of e){r.add(n.id);const e=t.get(n.id);if(!e){i.push(n);continue}const o=e.latitude!==n.latitude||e.longitude!==n.longitude,a=bt(e)!==bt(n),c=wt(e)!==wt(n);(o||a||c)&&s.push({flight:n,moved:o,restyled:a,retracked:c})}const n=[];for(const e of t.keys())r.has(e)||n.push(e);return{added:i,changed:s,removed:n}}(this._drawn,s);if(!r.added.length&&!r.changed.length&&!r.removed.length)return;const n=this._iconStyle();for(const t of r.removed){const s=this._markers.get(t);s&&(e.removeLayer(s),this._markers.delete(t));const r=this._tracks.get(t);r&&(i.removeLayer(r),this._tracks.delete(t)),this._selectedId===t&&(this._selectedId=void 0)}for(const i of r.added){const s=i.id,r=t.marker([i.latitude,i.longitude],{icon:jt(t,Vt(i,s===this._selectedId),n),title:xt(i),keyboard:!1});r.on("click",()=>this._select(s)),r.addTo(e),this._markers.set(s,r),this._drawTrack(t,i,n)}for(const{flight:e,moved:i,restyled:s,retracked:o}of r.changed){const r=this._markers.get(e.id);r&&(s&&r.setIcon(jt(t,Vt(e,e.id===this._selectedId),n)),i&&(this._glide(r),r.setLatLng([e.latitude,e.longitude]))),o&&this._drawTrack(t,e,n)}this._gliding.length&&(window.clearTimeout(this._glideTimer),this._glideTimer=window.setTimeout(()=>this._endGlide(),this._glideMs+200)),this._drawn=function(t){return new Map(t.map(t=>[t.id,t]))}(s)}_drawTrack(t,e,i){const s=this._trackLayer;if(!s)return;const r=e.coordinates,n=this._tracks.get(e.id);if(r.length<2)return void(n&&(s.removeLayer(n),this._tracks.delete(e.id)));if(n)return void n.setLatLngs(r);const o=e.id===this._selectedId,a=t.polyline(r,{...o?this._selectedTrackStyle(i):{color:i.color,weight:2,opacity:.45},lineJoin:"round",lineCap:"round",interactive:!1});a.addTo(s),this._tracks.set(e.id,a),o&&a.bringToFront()}_iconStyle(){return{size:28,color:this._themeColor("--primary-text-color","#212121"),outline:this._themeColor("--card-background-color","#ffffff"),groundColor:this._themeColor("--disabled-text-color","#8f8f8f"),selectedColor:this._themeColor("--primary-color","#03a9f4")}}_select(t){if(this._selectedId===t)return;const e=this._selectedId;this._selectedId=t,this._paintSelection(e);const i=this._drawn.get(t);i&&this._mapInstance?.panTo([i.latitude,i.longitude],{animate:!0})}_paintSelection(t){const e=this._mapEl()?.Leaflet;if(!e)return;const i=this._iconStyle();if(t&&t!==this._selectedId){const s=this._drawn.get(t),r=this._markers.get(t);s&&r&&r.setIcon(jt(e,Vt(s,!1),i)),this._tracks.get(t)?.setStyle({color:i.color,weight:2,opacity:.45})}const s=this._selectedId;if(!s)return;const r=this._drawn.get(s),n=this._markers.get(s);r&&n&&n.setIcon(jt(e,Vt(r,!0),i)),this._tracks.get(s)?.setStyle(this._selectedTrackStyle(i)).bringToFront()}_glide(t){if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;const e=t.getElement();e&&(e.style.transition=`transform ${this._glideMs}ms linear`,this._gliding.push(e))}_endGlide(){void 0!==this._glideTimer&&(window.clearTimeout(this._glideTimer),this._glideTimer=void 0);for(const t of this._gliding)t.style.transition="";this._gliding=[]}_selectedTrackStyle(t){return{color:t.selectedColor,weight:3,opacity:.9}}_drawAreaCentre(t){const e=this._bounds();if(!e||!this._baseLayer)return;const i=function(t){return[(t.north+t.south)/2,(t.west+t.east)/2]}(e);this._centreMarker?this._centreMarker.setLatLng(i):this._centreMarker=t.circleMarker(i,{radius:5,weight:2,color:this._themeColor("--primary-color","#03a9f4"),fillColor:this._themeColor("--card-background-color","#ffffff"),fillOpacity:1,interactive:!1}).addTo(this._baseLayer)}_fitToArea(t){const e=this._bounds();e&&(t.leafletMap?.invalidateSize(!1),t.fitBounds(function(t){return[[t.north,t.west],[t.south,t.east]]}(e),{pad:.05}))}_renderMap(){return null===this._mapAvailable?F`<div class="placeholder" style="height:${380}px">Loading map…</div>`:this._mapAvailable?F`
      <div class="map-wrap" style="height:${380}px">
        <ha-map .autoFit=${!1} .themeMode=${"auto"}></ha-map>
        <button class="recentre" title="Recentre on the watched area" @click=${this._onRecentre}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${"M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z"}></path></svg>
        </button>
      </div>
    `:F`<div class="placeholder error" style="height:${380}px">
        Map unavailable — Home Assistant's map component did not load.
      </div>`}_renderDetail(){const t=this._selectedId,e=t?this._flights().find(e=>e.id===t):void 0;return e?Rt(e):F`<div class="detail empty">Tap an aircraft on the map</div>`}render(){const t=this._config;if(!t)return W;const e=this._entity(),i=this._flights().length;return F`
      <ha-card>
        <div class="header">
          <div class="title">${this._title(e)}</div>
          ${e?F`<div class="count">${i} aircraft</div>`:W}
        </div>
        ${e?F`${this._renderMap()}${this._renderDetail()}`:F`<div class="body error">Entity <code>${t.entity}</code> not found.</div>`}
      </ha-card>
    `}}t([ht()],Wt.prototype,"_config",void 0),t([ht()],Wt.prototype,"_mapAvailable",void 0),t([ht()],Wt.prototype,"_selectedId",void 0),customElements.get(pt)||customElements.define(pt,Wt);export{Wt as FlightMapCard};
