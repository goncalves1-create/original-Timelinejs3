var TL;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/less/TL.Timeline.less":
/*!***********************************!*\
  !*** ./src/less/TL.Timeline.less ***!
  \***********************************/
/***/ (() => {

"use strict";
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/wicg-inert/dist/inert.esm.js":
/*!***************************************************!*\
  !*** ./node_modules/wicg-inert/dist/inert.esm.js ***!
  \***************************************************/
/***/ (() => {

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This work is licensed under the W3C Software and Document License
 * (http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).
 */

(function () {
  // Return early if we're not running inside of the browser.
  if (typeof window === 'undefined') {
    return;
  }

  // Convenience function for converting NodeLists.
  /** @type {typeof Array.prototype.slice} */
  var slice = Array.prototype.slice;

  /**
   * IE has a non-standard name for "matches".
   * @type {typeof Element.prototype.matches}
   */
  var matches = Element.prototype.matches || Element.prototype.msMatchesSelector;

  /** @type {string} */
  var _focusableElementsString = ['a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', 'button:not([disabled])', 'details', 'summary', 'iframe', 'object', 'embed', '[contenteditable]'].join(',');

  /**
   * `InertRoot` manages a single inert subtree, i.e. a DOM subtree whose root element has an `inert`
   * attribute.
   *
   * Its main functions are:
   *
   * - to create and maintain a set of managed `InertNode`s, including when mutations occur in the
   *   subtree. The `makeSubtreeUnfocusable()` method handles collecting `InertNode`s via registering
   *   each focusable node in the subtree with the singleton `InertManager` which manages all known
   *   focusable nodes within inert subtrees. `InertManager` ensures that a single `InertNode`
   *   instance exists for each focusable node which has at least one inert root as an ancestor.
   *
   * - to notify all managed `InertNode`s when this subtree stops being inert (i.e. when the `inert`
   *   attribute is removed from the root node). This is handled in the destructor, which calls the
   *   `deregister` method on `InertManager` for each managed inert node.
   */

  var InertRoot = function () {
    /**
     * @param {!HTMLElement} rootElement The HTMLElement at the root of the inert subtree.
     * @param {!InertManager} inertManager The global singleton InertManager object.
     */
    function InertRoot(rootElement, inertManager) {
      _classCallCheck(this, InertRoot);

      /** @type {!InertManager} */
      this._inertManager = inertManager;

      /** @type {!HTMLElement} */
      this._rootElement = rootElement;

      /**
       * @type {!Set<!InertNode>}
       * All managed focusable nodes in this InertRoot's subtree.
       */
      this._managedNodes = new Set();

      // Make the subtree hidden from assistive technology
      if (this._rootElement.hasAttribute('aria-hidden')) {
        /** @type {?string} */
        this._savedAriaHidden = this._rootElement.getAttribute('aria-hidden');
      } else {
        this._savedAriaHidden = null;
      }
      this._rootElement.setAttribute('aria-hidden', 'true');

      // Make all focusable elements in the subtree unfocusable and add them to _managedNodes
      this._makeSubtreeUnfocusable(this._rootElement);

      // Watch for:
      // - any additions in the subtree: make them unfocusable too
      // - any removals from the subtree: remove them from this inert root's managed nodes
      // - attribute changes: if `tabindex` is added, or removed from an intrinsically focusable
      //   element, make that node a managed node.
      this._observer = new MutationObserver(this._onMutation.bind(this));
      this._observer.observe(this._rootElement, { attributes: true, childList: true, subtree: true });
    }

    /**
     * Call this whenever this object is about to become obsolete.  This unwinds all of the state
     * stored in this object and updates the state of all of the managed nodes.
     */


    _createClass(InertRoot, [{
      key: 'destructor',
      value: function destructor() {
        this._observer.disconnect();

        if (this._rootElement) {
          if (this._savedAriaHidden !== null) {
            this._rootElement.setAttribute('aria-hidden', this._savedAriaHidden);
          } else {
            this._rootElement.removeAttribute('aria-hidden');
          }
        }

        this._managedNodes.forEach(function (inertNode) {
          this._unmanageNode(inertNode.node);
        }, this);

        // Note we cast the nulls to the ANY type here because:
        // 1) We want the class properties to be declared as non-null, or else we
        //    need even more casts throughout this code. All bets are off if an
        //    instance has been destroyed and a method is called.
        // 2) We don't want to cast "this", because we want type-aware optimizations
        //    to know which properties we're setting.
        this._observer = /** @type {?} */null;
        this._rootElement = /** @type {?} */null;
        this._managedNodes = /** @type {?} */null;
        this._inertManager = /** @type {?} */null;
      }

      /**
       * @return {!Set<!InertNode>} A copy of this InertRoot's managed nodes set.
       */

    }, {
      key: '_makeSubtreeUnfocusable',


      /**
       * @param {!Node} startNode
       */
      value: function _makeSubtreeUnfocusable(startNode) {
        var _this2 = this;

        composedTreeWalk(startNode, function (node) {
          return _this2._visitNode(node);
        });

        var activeElement = document.activeElement;

        if (!document.body.contains(startNode)) {
          // startNode may be in shadow DOM, so find its nearest shadowRoot to get the activeElement.
          var node = startNode;
          /** @type {!ShadowRoot|undefined} */
          var root = undefined;
          while (node) {
            if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
              root = /** @type {!ShadowRoot} */node;
              break;
            }
            node = node.parentNode;
          }
          if (root) {
            activeElement = root.activeElement;
          }
        }
        if (startNode.contains(activeElement)) {
          activeElement.blur();
          // In IE11, if an element is already focused, and then set to tabindex=-1
          // calling blur() will not actually move the focus.
          // To work around this we call focus() on the body instead.
          if (activeElement === document.activeElement) {
            document.body.focus();
          }
        }
      }

      /**
       * @param {!Node} node
       */

    }, {
      key: '_visitNode',
      value: function _visitNode(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        var element = /** @type {!HTMLElement} */node;

        // If a descendant inert root becomes un-inert, its descendants will still be inert because of
        // this inert root, so all of its managed nodes need to be adopted by this InertRoot.
        if (element !== this._rootElement && element.hasAttribute('inert')) {
          this._adoptInertRoot(element);
        }

        if (matches.call(element, _focusableElementsString) || element.hasAttribute('tabindex')) {
          this._manageNode(element);
        }
      }

      /**
       * Register the given node with this InertRoot and with InertManager.
       * @param {!Node} node
       */

    }, {
      key: '_manageNode',
      value: function _manageNode(node) {
        var inertNode = this._inertManager.register(node, this);
        this._managedNodes.add(inertNode);
      }

      /**
       * Unregister the given node with this InertRoot and with InertManager.
       * @param {!Node} node
       */

    }, {
      key: '_unmanageNode',
      value: function _unmanageNode(node) {
        var inertNode = this._inertManager.deregister(node, this);
        if (inertNode) {
          this._managedNodes['delete'](inertNode);
        }
      }

      /**
       * Unregister the entire subtree starting at `startNode`.
       * @param {!Node} startNode
       */

    }, {
      key: '_unmanageSubtree',
      value: function _unmanageSubtree(startNode) {
        var _this3 = this;

        composedTreeWalk(startNode, function (node) {
          return _this3._unmanageNode(node);
        });
      }

      /**
       * If a descendant node is found with an `inert` attribute, adopt its managed nodes.
       * @param {!HTMLElement} node
       */

    }, {
      key: '_adoptInertRoot',
      value: function _adoptInertRoot(node) {
        var inertSubroot = this._inertManager.getInertRoot(node);

        // During initialisation this inert root may not have been registered yet,
        // so register it now if need be.
        if (!inertSubroot) {
          this._inertManager.setInert(node, true);
          inertSubroot = this._inertManager.getInertRoot(node);
        }

        inertSubroot.managedNodes.forEach(function (savedInertNode) {
          this._manageNode(savedInertNode.node);
        }, this);
      }

      /**
       * Callback used when mutation observer detects subtree additions, removals, or attribute changes.
       * @param {!Array<!MutationRecord>} records
       * @param {!MutationObserver} self
       */

    }, {
      key: '_onMutation',
      value: function _onMutation(records, self) {
        records.forEach(function (record) {
          var target = /** @type {!HTMLElement} */record.target;
          if (record.type === 'childList') {
            // Manage added nodes
            slice.call(record.addedNodes).forEach(function (node) {
              this._makeSubtreeUnfocusable(node);
            }, this);

            // Un-manage removed nodes
            slice.call(record.removedNodes).forEach(function (node) {
              this._unmanageSubtree(node);
            }, this);
          } else if (record.type === 'attributes') {
            if (record.attributeName === 'tabindex') {
              // Re-initialise inert node if tabindex changes
              this._manageNode(target);
            } else if (target !== this._rootElement && record.attributeName === 'inert' && target.hasAttribute('inert')) {
              // If a new inert root is added, adopt its managed nodes and make sure it knows about the
              // already managed nodes from this inert subroot.
              this._adoptInertRoot(target);
              var inertSubroot = this._inertManager.getInertRoot(target);
              this._managedNodes.forEach(function (managedNode) {
                if (target.contains(managedNode.node)) {
                  inertSubroot._manageNode(managedNode.node);
                }
              });
            }
          }
        }, this);
      }
    }, {
      key: 'managedNodes',
      get: function get() {
        return new Set(this._managedNodes);
      }

      /** @return {boolean} */

    }, {
      key: 'hasSavedAriaHidden',
      get: function get() {
        return this._savedAriaHidden !== null;
      }

      /** @param {?string} ariaHidden */

    }, {
      key: 'savedAriaHidden',
      set: function set(ariaHidden) {
        this._savedAriaHidden = ariaHidden;
      }

      /** @return {?string} */
      ,
      get: function get() {
        return this._savedAriaHidden;
      }
    }]);

    return InertRoot;
  }();

  /**
   * `InertNode` initialises and manages a single inert node.
   * A node is inert if it is a descendant of one or more inert root elements.
   *
   * On construction, `InertNode` saves the existing `tabindex` value for the node, if any, and
   * either removes the `tabindex` attribute or sets it to `-1`, depending on whether the element
   * is intrinsically focusable or not.
   *
   * `InertNode` maintains a set of `InertRoot`s which are descendants of this `InertNode`. When an
   * `InertRoot` is destroyed, and calls `InertManager.deregister()`, the `InertManager` notifies the
   * `InertNode` via `removeInertRoot()`, which in turn destroys the `InertNode` if no `InertRoot`s
   * remain in the set. On destruction, `InertNode` reinstates the stored `tabindex` if one exists,
   * or removes the `tabindex` attribute if the element is intrinsically focusable.
   */


  var InertNode = function () {
    /**
     * @param {!Node} node A focusable element to be made inert.
     * @param {!InertRoot} inertRoot The inert root element associated with this inert node.
     */
    function InertNode(node, inertRoot) {
      _classCallCheck(this, InertNode);

      /** @type {!Node} */
      this._node = node;

      /** @type {boolean} */
      this._overrodeFocusMethod = false;

      /**
       * @type {!Set<!InertRoot>} The set of descendant inert roots.
       *    If and only if this set becomes empty, this node is no longer inert.
       */
      this._inertRoots = new Set([inertRoot]);

      /** @type {?number} */
      this._savedTabIndex = null;

      /** @type {boolean} */
      this._destroyed = false;

      // Save any prior tabindex info and make this node untabbable
      this.ensureUntabbable();
    }

    /**
     * Call this whenever this object is about to become obsolete.
     * This makes the managed node focusable again and deletes all of the previously stored state.
     */


    _createClass(InertNode, [{
      key: 'destructor',
      value: function destructor() {
        this._throwIfDestroyed();

        if (this._node && this._node.nodeType === Node.ELEMENT_NODE) {
          var element = /** @type {!HTMLElement} */this._node;
          if (this._savedTabIndex !== null) {
            element.setAttribute('tabindex', this._savedTabIndex);
          } else {
            element.removeAttribute('tabindex');
          }

          // Use `delete` to restore native focus method.
          if (this._overrodeFocusMethod) {
            delete element.focus;
          }
        }

        // See note in InertRoot.destructor for why we cast these nulls to ANY.
        this._node = /** @type {?} */null;
        this._inertRoots = /** @type {?} */null;
        this._destroyed = true;
      }

      /**
       * @type {boolean} Whether this object is obsolete because the managed node is no longer inert.
       * If the object has been destroyed, any attempt to access it will cause an exception.
       */

    }, {
      key: '_throwIfDestroyed',


      /**
       * Throw if user tries to access destroyed InertNode.
       */
      value: function _throwIfDestroyed() {
        if (this.destroyed) {
          throw new Error('Trying to access destroyed InertNode');
        }
      }

      /** @return {boolean} */

    }, {
      key: 'ensureUntabbable',


      /** Save the existing tabindex value and make the node untabbable and unfocusable */
      value: function ensureUntabbable() {
        if (this.node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        var element = /** @type {!HTMLElement} */this.node;
        if (matches.call(element, _focusableElementsString)) {
          if ( /** @type {!HTMLElement} */element.tabIndex === -1 && this.hasSavedTabIndex) {
            return;
          }

          if (element.hasAttribute('tabindex')) {
            this._savedTabIndex = /** @type {!HTMLElement} */element.tabIndex;
          }
          element.setAttribute('tabindex', '-1');
          if (element.nodeType === Node.ELEMENT_NODE) {
            element.focus = function () {};
            this._overrodeFocusMethod = true;
          }
        } else if (element.hasAttribute('tabindex')) {
          this._savedTabIndex = /** @type {!HTMLElement} */element.tabIndex;
          element.removeAttribute('tabindex');
        }
      }

      /**
       * Add another inert root to this inert node's set of managing inert roots.
       * @param {!InertRoot} inertRoot
       */

    }, {
      key: 'addInertRoot',
      value: function addInertRoot(inertRoot) {
        this._throwIfDestroyed();
        this._inertRoots.add(inertRoot);
      }

      /**
       * Remove the given inert root from this inert node's set of managing inert roots.
       * If the set of managing inert roots becomes empty, this node is no longer inert,
       * so the object should be destroyed.
       * @param {!InertRoot} inertRoot
       */

    }, {
      key: 'removeInertRoot',
      value: function removeInertRoot(inertRoot) {
        this._throwIfDestroyed();
        this._inertRoots['delete'](inertRoot);
        if (this._inertRoots.size === 0) {
          this.destructor();
        }
      }
    }, {
      key: 'destroyed',
      get: function get() {
        return (/** @type {!InertNode} */this._destroyed
        );
      }
    }, {
      key: 'hasSavedTabIndex',
      get: function get() {
        return this._savedTabIndex !== null;
      }

      /** @return {!Node} */

    }, {
      key: 'node',
      get: function get() {
        this._throwIfDestroyed();
        return this._node;
      }

      /** @param {?number} tabIndex */

    }, {
      key: 'savedTabIndex',
      set: function set(tabIndex) {
        this._throwIfDestroyed();
        this._savedTabIndex = tabIndex;
      }

      /** @return {?number} */
      ,
      get: function get() {
        this._throwIfDestroyed();
        return this._savedTabIndex;
      }
    }]);

    return InertNode;
  }();

  /**
   * InertManager is a per-document singleton object which manages all inert roots and nodes.
   *
   * When an element becomes an inert root by having an `inert` attribute set and/or its `inert`
   * property set to `true`, the `setInert` method creates an `InertRoot` object for the element.
   * The `InertRoot` in turn registers itself as managing all of the element's focusable descendant
   * nodes via the `register()` method. The `InertManager` ensures that a single `InertNode` instance
   * is created for each such node, via the `_managedNodes` map.
   */


  var InertManager = function () {
    /**
     * @param {!Document} document
     */
    function InertManager(document) {
      _classCallCheck(this, InertManager);

      if (!document) {
        throw new Error('Missing required argument; InertManager needs to wrap a document.');
      }

      /** @type {!Document} */
      this._document = document;

      /**
       * All managed nodes known to this InertManager. In a map to allow looking up by Node.
       * @type {!Map<!Node, !InertNode>}
       */
      this._managedNodes = new Map();

      /**
       * All inert roots known to this InertManager. In a map to allow looking up by Node.
       * @type {!Map<!Node, !InertRoot>}
       */
      this._inertRoots = new Map();

      /**
       * Observer for mutations on `document.body`.
       * @type {!MutationObserver}
       */
      this._observer = new MutationObserver(this._watchForInert.bind(this));

      // Add inert style.
      addInertStyle(document.head || document.body || document.documentElement);

      // Wait for document to be loaded.
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', this._onDocumentLoaded.bind(this));
      } else {
        this._onDocumentLoaded();
      }
    }

    /**
     * Set whether the given element should be an inert root or not.
     * @param {!HTMLElement} root
     * @param {boolean} inert
     */


    _createClass(InertManager, [{
      key: 'setInert',
      value: function setInert(root, inert) {
        if (inert) {
          if (this._inertRoots.has(root)) {
            // element is already inert
            return;
          }

          var inertRoot = new InertRoot(root, this);
          root.setAttribute('inert', '');
          this._inertRoots.set(root, inertRoot);
          // If not contained in the document, it must be in a shadowRoot.
          // Ensure inert styles are added there.
          if (!this._document.body.contains(root)) {
            var parent = root.parentNode;
            while (parent) {
              if (parent.nodeType === 11) {
                addInertStyle(parent);
              }
              parent = parent.parentNode;
            }
          }
        } else {
          if (!this._inertRoots.has(root)) {
            // element is already non-inert
            return;
          }

          var _inertRoot = this._inertRoots.get(root);
          _inertRoot.destructor();
          this._inertRoots['delete'](root);
          root.removeAttribute('inert');
        }
      }

      /**
       * Get the InertRoot object corresponding to the given inert root element, if any.
       * @param {!Node} element
       * @return {!InertRoot|undefined}
       */

    }, {
      key: 'getInertRoot',
      value: function getInertRoot(element) {
        return this._inertRoots.get(element);
      }

      /**
       * Register the given InertRoot as managing the given node.
       * In the case where the node has a previously existing inert root, this inert root will
       * be added to its set of inert roots.
       * @param {!Node} node
       * @param {!InertRoot} inertRoot
       * @return {!InertNode} inertNode
       */

    }, {
      key: 'register',
      value: function register(node, inertRoot) {
        var inertNode = this._managedNodes.get(node);
        if (inertNode !== undefined) {
          // node was already in an inert subtree
          inertNode.addInertRoot(inertRoot);
        } else {
          inertNode = new InertNode(node, inertRoot);
        }

        this._managedNodes.set(node, inertNode);

        return inertNode;
      }

      /**
       * De-register the given InertRoot as managing the given inert node.
       * Removes the inert root from the InertNode's set of managing inert roots, and remove the inert
       * node from the InertManager's set of managed nodes if it is destroyed.
       * If the node is not currently managed, this is essentially a no-op.
       * @param {!Node} node
       * @param {!InertRoot} inertRoot
       * @return {?InertNode} The potentially destroyed InertNode associated with this node, if any.
       */

    }, {
      key: 'deregister',
      value: function deregister(node, inertRoot) {
        var inertNode = this._managedNodes.get(node);
        if (!inertNode) {
          return null;
        }

        inertNode.removeInertRoot(inertRoot);
        if (inertNode.destroyed) {
          this._managedNodes['delete'](node);
        }

        return inertNode;
      }

      /**
       * Callback used when document has finished loading.
       */

    }, {
      key: '_onDocumentLoaded',
      value: function _onDocumentLoaded() {
        // Find all inert roots in document and make them actually inert.
        var inertElements = slice.call(this._document.querySelectorAll('[inert]'));
        inertElements.forEach(function (inertElement) {
          this.setInert(inertElement, true);
        }, this);

        // Comment this out to use programmatic API only.
        this._observer.observe(this._document.body || this._document.documentElement, { attributes: true, subtree: true, childList: true });
      }

      /**
       * Callback used when mutation observer detects attribute changes.
       * @param {!Array<!MutationRecord>} records
       * @param {!MutationObserver} self
       */

    }, {
      key: '_watchForInert',
      value: function _watchForInert(records, self) {
        var _this = this;
        records.forEach(function (record) {
          switch (record.type) {
            case 'childList':
              slice.call(record.addedNodes).forEach(function (node) {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                  return;
                }
                var inertElements = slice.call(node.querySelectorAll('[inert]'));
                if (matches.call(node, '[inert]')) {
                  inertElements.unshift(node);
                }
                inertElements.forEach(function (inertElement) {
                  this.setInert(inertElement, true);
                }, _this);
              }, _this);
              break;
            case 'attributes':
              if (record.attributeName !== 'inert') {
                return;
              }
              var target = /** @type {!HTMLElement} */record.target;
              var inert = target.hasAttribute('inert');
              _this.setInert(target, inert);
              break;
          }
        }, this);
      }
    }]);

    return InertManager;
  }();

  /**
   * Recursively walk the composed tree from |node|.
   * @param {!Node} node
   * @param {(function (!HTMLElement))=} callback Callback to be called for each element traversed,
   *     before descending into child nodes.
   * @param {?ShadowRoot=} shadowRootAncestor The nearest ShadowRoot ancestor, if any.
   */


  function composedTreeWalk(node, callback, shadowRootAncestor) {
    if (node.nodeType == Node.ELEMENT_NODE) {
      var element = /** @type {!HTMLElement} */node;
      if (callback) {
        callback(element);
      }

      // Descend into node:
      // If it has a ShadowRoot, ignore all child elements - these will be picked
      // up by the <content> or <shadow> elements. Descend straight into the
      // ShadowRoot.
      var shadowRoot = /** @type {!HTMLElement} */element.shadowRoot;
      if (shadowRoot) {
        composedTreeWalk(shadowRoot, callback, shadowRoot);
        return;
      }

      // If it is a <content> element, descend into distributed elements - these
      // are elements from outside the shadow root which are rendered inside the
      // shadow DOM.
      if (element.localName == 'content') {
        var content = /** @type {!HTMLContentElement} */element;
        // Verifies if ShadowDom v0 is supported.
        var distributedNodes = content.getDistributedNodes ? content.getDistributedNodes() : [];
        for (var i = 0; i < distributedNodes.length; i++) {
          composedTreeWalk(distributedNodes[i], callback, shadowRootAncestor);
        }
        return;
      }

      // If it is a <slot> element, descend into assigned nodes - these
      // are elements from outside the shadow root which are rendered inside the
      // shadow DOM.
      if (element.localName == 'slot') {
        var slot = /** @type {!HTMLSlotElement} */element;
        // Verify if ShadowDom v1 is supported.
        var _distributedNodes = slot.assignedNodes ? slot.assignedNodes({ flatten: true }) : [];
        for (var _i = 0; _i < _distributedNodes.length; _i++) {
          composedTreeWalk(_distributedNodes[_i], callback, shadowRootAncestor);
        }
        return;
      }
    }

    // If it is neither the parent of a ShadowRoot, a <content> element, a <slot>
    // element, nor a <shadow> element recurse normally.
    var child = node.firstChild;
    while (child != null) {
      composedTreeWalk(child, callback, shadowRootAncestor);
      child = child.nextSibling;
    }
  }

  /**
   * Adds a style element to the node containing the inert specific styles
   * @param {!Node} node
   */
  function addInertStyle(node) {
    if (node.querySelector('style#inert-style, link#inert-style')) {
      return;
    }
    var style = document.createElement('style');
    style.setAttribute('id', 'inert-style');
    style.textContent = '\n' + '[inert] {\n' + '  pointer-events: none;\n' + '  cursor: default;\n' + '}\n' + '\n' + '[inert], [inert] * {\n' + '  -webkit-user-select: none;\n' + '  -moz-user-select: none;\n' + '  -ms-user-select: none;\n' + '  user-select: none;\n' + '}\n';
    node.appendChild(style);
  }

  if (!HTMLElement.prototype.hasOwnProperty('inert')) {
    /** @type {!InertManager} */
    var inertManager = new InertManager(document);

    Object.defineProperty(HTMLElement.prototype, 'inert', {
      enumerable: true,
      /** @this {!HTMLElement} */
      get: function get() {
        return this.hasAttribute('inert');
      },
      /** @this {!HTMLElement} */
      set: function set(inert) {
        inertManager.setInert(this, inert);
      }
    });
  }
})();


/***/ }),

/***/ "./src/js/animation/Animate.js":
/*!*************************************!*\
  !*** ./src/js/animation/Animate.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animate: () => (/* binding */ Animate)
/* harmony export */ });
/*	Animate
  Basic animation
  once we've switched to an npm buildable model
  we could probably replace this with a true dependency upon
  https://www.npmjs.com/package/morpheus
================================================== */

function Animate(el, options) {
	return tlanimate(el, options)
};


/*	Based on: Morpheus
	https://github.com/ded/morpheus - (c) Dustin Diaz 2011
	License MIT
================================================== */
const tlanimate = function () {

	var doc = document,
		win = window,
		perf = win.performance,
		perfNow = perf && (perf.now || perf.webkitNow || perf.msNow || perf.mozNow),
		now = perfNow ? function () { return perfNow.call(perf) } : function () { return +new Date() },
		html = doc.documentElement,
		fixTs = false, // feature detected below
		thousand = 1000,
		rgbOhex = /^rgb\(|#/,
		relVal = /^([+\-])=([\d\.]+)/,
		numUnit = /^(?:[\+\-]=?)?\d+(?:\.\d+)?(%|in|cm|mm|em|ex|pt|pc|px)$/,
		rotate = /rotate\(((?:[+\-]=)?([\-\d\.]+))deg\)/,
		scale = /scale\(((?:[+\-]=)?([\d\.]+))\)/,
		skew = /skew\(((?:[+\-]=)?([\-\d\.]+))deg, ?((?:[+\-]=)?([\-\d\.]+))deg\)/,
		translate = /translate\(((?:[+\-]=)?([\-\d\.]+))px, ?((?:[+\-]=)?([\-\d\.]+))px\)/,
		// these elements do not require 'px'
		unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, transform: 1};

  // which property name does this browser use for transform
	var transform = function () {
		var styles = doc.createElement('a').style,
			props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'],
			i;

		for (i = 0; i < props.length; i++) {
			if (props[i] in styles) return props[i]
		};
	}();

	// does this browser support the opacity property?
	var opacity = function () {
		return typeof doc.createElement('a').style.opacity !== 'undefined'
	}();

	// initial style is determined by the elements themselves
	var getStyle = doc.defaultView && doc.defaultView.getComputedStyle ?
	function (el, property) {
		property = property == 'transform' ? transform : property
		property = camelize(property)
		var value = null,
			computed = doc.defaultView.getComputedStyle(el, '');

		computed && (value = computed[property]);
		return el.style[property] || value;
	} : html.currentStyle ?

    function (el, property) {
		property = camelize(property)

		if (property == 'opacity') {
			var val = 100
			try {
				val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity
			} catch (e1) {
				try {
					val = el.filters('alpha').opacity
				} catch (e2) {

				}
			}
			return val / 100
		}
		var value = el.currentStyle ? el.currentStyle[property] : null
		return el.style[property] || value
	} :

    function (el, property) {
		return el.style[camelize(property)]
    }

  var frame = function () {
    // native animation frames
    // http://webstuff.nfshost.com/anim-timing/Overview.html
    // http://dev.chromium.org/developers/design-documents/requestanimationframe-implementation
    return win.requestAnimationFrame  ||
      win.webkitRequestAnimationFrame ||
      win.mozRequestAnimationFrame    ||
      win.msRequestAnimationFrame     ||
      win.oRequestAnimationFrame      ||
      function (callback) {
        win.setTimeout(function () {
          callback(+new Date())
        }, 17) // when I was 17..
      }
  }()

  var children = []

	frame(function(timestamp) {
	  	// feature-detect if rAF and now() are of the same scale (epoch or high-res),
		// if not, we have to do a timestamp fix on each frame
		fixTs = timestamp > 1e12 != now() > 1e12
	})

  function has(array, elem, i) {
    if (Array.prototype.indexOf) return array.indexOf(elem)
    for (i = 0; i < array.length; ++i) {
      if (array[i] === elem) return i
    }
  }

  function render(timestamp) {
    var i, count = children.length
    // if we're using a high res timer, make sure timestamp is not the old epoch-based value.
    // http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
    if (perfNow && timestamp > 1e12) timestamp = now()
	if (fixTs) timestamp = now()
    for (i = count; i--;) {
      children[i](timestamp)
    }
    children.length && frame(render)
  }

  function live(f) {
    if (children.push(f) === 1) frame(render)
  }

  function die(f) {
    var rest, index = has(children, f)
    if (index >= 0) {
      rest = children.slice(index + 1)
      children.length = index
      children = children.concat(rest)
    }
  }

  function parseTransform(style, base) {
    var values = {}, m
    if (m = style.match(rotate)) values.rotate = by(m[1], base ? base.rotate : null)
    if (m = style.match(scale)) values.scale = by(m[1], base ? base.scale : null)
    if (m = style.match(skew)) {values.skewx = by(m[1], base ? base.skewx : null); values.skewy = by(m[3], base ? base.skewy : null)}
    if (m = style.match(translate)) {values.translatex = by(m[1], base ? base.translatex : null); values.translatey = by(m[3], base ? base.translatey : null)}
    return values
  }

  function formatTransform(v) {
    var s = ''
    if ('rotate' in v) s += 'rotate(' + v.rotate + 'deg) '
    if ('scale' in v) s += 'scale(' + v.scale + ') '
    if ('translatex' in v) s += 'translate(' + v.translatex + 'px,' + v.translatey + 'px) '
    if ('skewx' in v) s += 'skew(' + v.skewx + 'deg,' + v.skewy + 'deg)'
    return s
  }

  function rgb(r, g, b) {
    return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)
  }

  // convert rgb and short hex to long hex
  function toHex(c) {
    var m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    return (m ? rgb(m[1], m[2], m[3]) : c)
      .replace(/#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3') // short skirt to long jacket
  }

  // change font-size => fontSize etc.
  function camelize(s) {
    return s.replace(/-(.)/g, function (m, m1) {
      return m1.toUpperCase()
    })
  }

  // aren't we having it?
  function fun(f) {
    return typeof f == 'function'
  }

  function nativeTween(t) {
    // default to a pleasant-to-the-eye easeOut (like native animations)
    return Math.sin(t * Math.PI / 2)
  }

  /**
    * Core tween method that requests each frame
    * @param duration: time in milliseconds. defaults to 1000
    * @param fn: tween frame callback function receiving 'position'
    * @param done {optional}: complete callback function
    * @param ease {optional}: easing method. defaults to easeOut
    * @param from {optional}: integer to start from
    * @param to {optional}: integer to end at
    * @returns method to stop the animation
    */
  function tween(duration, fn, done, ease, from, to) {
    ease = fun(ease) ? ease : morpheus.easings[ease] || nativeTween
    var time = duration || thousand
      , self = this
      , diff = to - from
      , start = now()
      , stop = 0
      , end = 0

    function run(t) {
      var delta = t - start
      if (delta > time || stop) {
        to = isFinite(to) ? to : 1
        stop ? end && fn(to) : fn(to)
        die(run)
        return done && done.apply(self)
      }
      // if you don't specify a 'to' you can use tween as a generic delta tweener
      // cool, eh?
      isFinite(to) ?
        fn((diff * ease(delta / time)) + from) :
        fn(ease(delta / time))
    }

    live(run)

    return {
      stop: function (jump) {
        stop = 1
        end = jump // jump to end of animation?
        if (!jump) done = null // remove callback if not jumping to end
      }
    }
  }

  /**
    * generic bezier method for animating x|y coordinates
    * minimum of 2 points required (start and end).
    * first point start, last point end
    * additional control points are optional (but why else would you use this anyway ;)
    * @param points: array containing control points
       [[0, 0], [100, 200], [200, 100]]
    * @param pos: current be(tween) position represented as float  0 - 1
    * @return [x, y]
    */
  function bezier(points, pos) {
    var n = points.length, r = [], i, j
    for (i = 0; i < n; ++i) {
      r[i] = [points[i][0], points[i][1]]
    }
    for (j = 1; j < n; ++j) {
      for (i = 0; i < n - j; ++i) {
        r[i][0] = (1 - pos) * r[i][0] + pos * r[parseInt(i + 1, 10)][0]
        r[i][1] = (1 - pos) * r[i][1] + pos * r[parseInt(i + 1, 10)][1]
      }
    }
    return [r[0][0], r[0][1]]
  }

  // this gets you the next hex in line according to a 'position'
  function nextColor(pos, start, finish) {
    var r = [], i, e, from, to
    for (i = 0; i < 6; i++) {
      from = Math.min(15, parseInt(start.charAt(i),  16))
      to   = Math.min(15, parseInt(finish.charAt(i), 16))
      e = Math.floor((to - from) * pos + from)
      e = e > 15 ? 15 : e < 0 ? 0 : e
      r[i] = e.toString(16)
    }
    return '#' + r.join('')
  }

  // this retreives the frame value within a sequence
  function getTweenVal(pos, units, begin, end, k, i, v) {
    if (k == 'transform') {
      v = {}
      for (var t in begin[i][k]) {
        v[t] = (t in end[i][k]) ? Math.round(((end[i][k][t] - begin[i][k][t]) * pos + begin[i][k][t]) * thousand) / thousand : begin[i][k][t]
      }
      return v
    } else if (typeof begin[i][k] == 'string') {
      return nextColor(pos, begin[i][k], end[i][k])
    } else {
      // round so we don't get crazy long floats
      v = Math.round(((end[i][k] - begin[i][k]) * pos + begin[i][k]) * thousand) / thousand
      // some css properties don't require a unit (like zIndex, lineHeight, opacity)
      if (!(k in unitless)) v += units[i][k] || 'px'
      return v
    }
  }

  // support for relative movement via '+=n' or '-=n'
  function by(val, start, m, r, i) {
    return (m = relVal.exec(val)) ?
      (i = parseFloat(m[2])) && (start + (m[1] == '+' ? 1 : -1) * i) :
      parseFloat(val)
  }

  /**
    * morpheus:
    * @param element(s): HTMLElement(s)
    * @param options: mixed bag between CSS Style properties & animation options
    *  - {n} CSS properties|values
    *     - value can be strings, integers,
    *     - or callback function that receives element to be animated. method must return value to be tweened
    *     - relative animations start with += or -= followed by integer
    *  - duration: time in ms - defaults to 1000(ms)
    *  - easing: a transition method - defaults to an 'easeOut' algorithm
    *  - complete: a callback method for when all elements have finished
    *  - bezier: array of arrays containing x|y coordinates that define the bezier points. defaults to none
    *     - this may also be a function that receives element to be animated. it must return a value
    */
  function morpheus(elements, options) {
    var els = elements ? (els = isFinite(elements.length) ? elements : [elements]) : [], i
      , complete = options.complete
      , duration = options.duration
      , ease = options.easing
      , points = options.bezier
      , begin = []
      , end = []
      , units = []
      , bez = []
      , originalLeft
      , originalTop

    if (points) {
      // remember the original values for top|left
      originalLeft = options.left;
      originalTop = options.top;
      delete options.right;
      delete options.bottom;
      delete options.left;
      delete options.top;
    }

    for (i = els.length; i--;) {

      // record beginning and end states to calculate positions
      begin[i] = {}
      end[i] = {}
      units[i] = {}

      // are we 'moving'?
      if (points) {

        var left = getStyle(els[i], 'left')
          , top = getStyle(els[i], 'top')
          , xy = [by(fun(originalLeft) ? originalLeft(els[i]) : originalLeft || 0, parseFloat(left)),
                  by(fun(originalTop) ? originalTop(els[i]) : originalTop || 0, parseFloat(top))]

        bez[i] = fun(points) ? points(els[i], xy) : points
        bez[i].push(xy)
        bez[i].unshift([
          parseInt(left, 10),
          parseInt(top, 10)
        ])
      }

      for (var k in options) {
        switch (k) {
        case 'complete':
        case 'duration':
        case 'easing':
        case 'bezier':
          continue
        }
        var v = getStyle(els[i], k), unit
          , tmp = fun(options[k]) ? options[k](els[i]) : options[k]
        if (typeof tmp == 'string' &&
            rgbOhex.test(tmp) &&
            !rgbOhex.test(v)) {
          delete options[k]; // remove key :(
          continue; // cannot animate colors like 'orange' or 'transparent'
                    // only #xxx, #xxxxxx, rgb(n,n,n)
        }

        begin[i][k] = k == 'transform' ? parseTransform(v) :
          typeof tmp == 'string' && rgbOhex.test(tmp) ?
            toHex(v).slice(1) :
            parseFloat(v)
        end[i][k] = k == 'transform' ? parseTransform(tmp, begin[i][k]) :
          typeof tmp == 'string' && tmp.charAt(0) == '#' ?
            toHex(tmp).slice(1) :
            by(tmp, parseFloat(v));
        // record original unit
        (typeof tmp == 'string') && (unit = tmp.match(numUnit)) && (units[i][k] = unit[1])
      }
    }
    // ONE TWEEN TO RULE THEM ALL
    return tween.apply(els, [duration, function (pos, v, xy) {
      // normally not a fan of optimizing for() loops, but we want something
      // fast for animating
      for (i = els.length; i--;) {
        if (points) {
          xy = bezier(bez[i], pos)
          els[i].style.left = xy[0] + 'px'
          els[i].style.top = xy[1] + 'px'
        }
        for (var k in options) {
          v = getTweenVal(pos, units, begin, end, k, i)
          k == 'transform' ?
            els[i].style[transform] = formatTransform(v) :
            k == 'opacity' && !opacity ?
              (els[i].style.filter = 'alpha(opacity=' + (v * 100) + ')') :
              (els[i].style[camelize(k)] = v)
        }
      }
    }, complete, ease])
  }

  // expose useful methods
  morpheus.tween = tween
  morpheus.getStyle = getStyle
  morpheus.bezier = bezier
  morpheus.transform = transform
  morpheus.parseTransform = parseTransform
  morpheus.formatTransform = formatTransform
  morpheus.easings = {}

  return morpheus
}() // must be executed at initialization

/***/ }),

/***/ "./src/js/animation/Ease.js":
/*!**********************************!*\
  !*** ./src/js/animation/Ease.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   easeInOutQuint: () => (/* binding */ easeInOutQuint),
/* harmony export */   easeInSpline: () => (/* binding */ easeInSpline),
/* harmony export */   easeOutStrong: () => (/* binding */ easeOutStrong)
/* harmony export */ });
/* unused harmony exports easeInOutExpo, easeOut, easeIn, easeInStrong, easeOutBounce, easeInBack, easeOutBack, bounce, bouncePast, swingTo, swingFrom, elastic, spring, blink, pulse, wobble, flicker, mirror, easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic, easeInQuart, easeOutQuart, easeInOutQuart, easeInQuint, easeOutQuint */
/* The equations defined here are open source under BSD License.
 * http://www.robertpenner.com/easing_terms_of_use.html (c) 2003 Robert Penner
 * Adapted to single time-based by
 * Brian Crescimanno <brian.crescimanno@gmail.com>
 * Ken Snyder <kendsnyder@gmail.com>
 */

/** MIT License
 *
 * KeySpline - use bezier curve for transition easing function
 * Copyright (c) 2012 Gaetan Renaudeau <renaudeau.gaetan@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
/**
 * KeySpline - use bezier curve for transition easing function
 * is inspired from Firefox's nsSMILKeySpline.cpp
 * Usage:
 * var spline = new KeySpline(0.25, 0.1, 0.25, 1.0)
 * spline.get(x) => returns the easing value | x must be in [0, 1] range
 */

const Easings = {
    ease:        [0.25, 0.1, 0.25, 1.0], 
    linear:      [0.00, 0.0, 1.00, 1.0],
    easein:     [0.42, 0.0, 1.00, 1.0],
    easeout:    [0.00, 0.0, 0.58, 1.0],
    easeinout: [0.42, 0.0, 0.58, 1.0]
};

function sinusoidal(pos){
	return (-Math.cos(pos * Math.PI) / 2) + 0.5;
}

function KeySpline(a) {
//KeySpline(mX1, mY1, mX2, mY2){
    function get(aX) {
           if (a[0] == a[1] && a[2] == a[3]) return aX; // linear
           return CalcBezier(GetTForX(aX), a[1], a[3]);
       }

	function A(aA1, aA2) {
		return 1.0 - 3.0 * aA2 + 3.0 * aA1;
	}

	function B(aA1, aA2) {
		return 3.0 * aA2 - 6.0 * aA1;
	}

	function C(aA1) {
		return 3.0 * aA1;
	}

	// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.

	function CalcBezier(aT, aA1, aA2) {
		return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
	}

	// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.

	function GetSlope(aT, aA1, aA2) {
		return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
	}

	function GetTForX(aX) {
		// Newton raphson iteration
		var aGuessT = aX;
		for (var i = 0; i < 4; ++i) {
			var currentSlope = GetSlope(aGuessT, a[0], a[2]);
			if (currentSlope == 0.0) return aGuessT;
			var currentX = CalcBezier(aGuessT, a[0], a[2]) - aX;
			aGuessT -= currentX / currentSlope;
		}
		return aGuessT;
	}
}
	


function easeInSpline(t){
	var spline = new KeySpline(Easings.easein);
	return spline.get(t);
}

function easeInOutExpo(t){
	var spline = new KeySpline(Easings.easein);
	return spline.get(t);
}

function easeOut(t){
	return Math.sin(t * Math.PI / 2);
}
function easeOutStrong(t){
	return (t == 1) ? 1 : 1 - Math.pow(2, - 10 * t);
}
function easeIn(t){
	return t * t;
}
function easeInStrong(t){
	return (t == 0) ? 0 : Math.pow(2, 10 * (t - 1));
}
function easeOutBounce(pos){
	if ((pos) < (1 / 2.75)) {
		return (7.5625 * pos * pos);
	} else if (pos < (2 / 2.75)) {
		return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
	} else if (pos < (2.5 / 2.75)) {
		return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
	} else {
		return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
	}
}
function easeInBack(pos){
	var s = 1.70158;
	return (pos) * pos * ((s + 1) * pos - s);
}
function easeOutBack(pos){
	var s = 1.70158;
	return (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1;
}
function bounce(t){
	if (t < (1 / 2.75)) {
		return 7.5625 * t * t;
	}
	if (t < (2 / 2.75)) {
		return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
	}
	if (t < (2.5 / 2.75)) {
		return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
	}
	return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
}
function bouncePast(pos){
	if (pos < (1 / 2.75)) {
		return (7.5625 * pos * pos);
	} else if (pos < (2 / 2.75)) {
		return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
	} else if (pos < (2.5 / 2.75)) {
		return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
	} else {
		return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
	}
}
function swingTo(pos){
	var s = 1.70158;
	return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
}
function swingFrom(pos){
	var s = 1.70158;
	return pos * pos * ((s + 1) * pos - s);
}
function elastic(pos){
	return -1 * Math.pow(4, - 8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1;
}
function spring(pos){
	return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
}
function blink(pos, blinks){
	return Math.round(pos * (blinks || 5)) % 2;
}
function pulse(pos, pulses){
	return (-Math.cos((pos * ((pulses || 5) - .5) * 2) * Math.PI) / 2) + .5;
}
function wobble(pos){
	return (-Math.cos(pos * Math.PI * (9 * pos)) / 2) + 0.5;
}

function flicker(pos){
	var pos = pos + (Math.random() - 0.5) / 5;
	return sinusoidal(pos < 0 ? 0 : pos > 1 ? 1 : pos);
}
function mirror(pos){
	if (pos < 0.5) return sinusoidal(pos * 2);
	else return sinusoidal(1 - (pos - 0.5) * 2);
}
// accelerating from zero velocity
function easeInQuad(t){ return t*t }
// decelerating to zero velocity
function easeOutQuad(t){ return t*(2-t) }
// acceleration until halfway, then deceleration
function easeInOutQuad(t){ return t<.5 ? 2*t*t : -1+(4-2*t)*t }
// accelerating from zero velocity 
function easeInCubic(t){ return t*t*t }
// decelerating to zero velocity 
function easeOutCubic(t){ return (--t)*t*t+1 }
// acceleration until halfway, then deceleration 
function easeInOutCubic(t){ return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }
// accelerating from zero velocity 
function easeInQuart(t){ return t*t*t*t }
// decelerating to zero velocity 
function easeOutQuart(t){ return 1-(--t)*t*t*t }
// acceleration until halfway, then deceleration
function easeInOutQuart(t){ return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t }
// accelerating from zero velocity
function easeInQuint(t){ return t*t*t*t*t }
// decelerating to zero velocity
function easeOutQuint(t){ return 1+(--t)*t*t*t*t }
// acceleration until halfway, then deceleration 
function easeInOutQuint(t){ return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }



/***/ }),

/***/ "./src/js/core/Browser.js":
/*!********************************!*\
  !*** ./src/js/core/Browser.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   android: () => (/* binding */ android),
/* harmony export */   edge: () => (/* binding */ edge),
/* harmony export */   firefox: () => (/* binding */ firefox),
/* harmony export */   ie: () => (/* binding */ ie),
/* harmony export */   mobile: () => (/* binding */ mobile),
/* harmony export */   orientation: () => (/* binding */ orientation),
/* harmony export */   touch: () => (/* binding */ touch),
/* harmony export */   webkit: () => (/* binding */ webkit),
/* harmony export */   webkit3d: () => (/* binding */ webkit3d)
/* harmony export */ });
/* unused harmony exports ua, ie9, ielt9, android23, msPointer, pointer, opera, gecko, chrome, ie3d, gecko3d, opera3d, any3d, mobileWebkit, mobileWebkit3d, mobileOpera, retina */
/*
	Based on Leaflet Browser
*/

const ua = navigator ? navigator.userAgent.toLowerCase() : 'no-user-agent-specified';

const doc = document ? document.documentElement : null;
const phantomjs = ua ? ua.indexOf("phantom") !== -1 : false;


const ie = window && 'ActiveXObject' in window

const ie9 = Boolean(ie && ua.match(/MSIE 9/i))
const ielt9 = ie && document && !document.addEventListener

const webkit = ua.indexOf('webkit') !== -1
const android = ua.indexOf('android') !== -1

const android23 = ua.search('android [23]') !== -1
const mobile = (window) ? typeof window.orientation !== 'undefined' : false
const msPointer = (navigator && window) ? navigator.msPointerEnabled && navigator.msMaxTouchPoints && !window.PointerEvent : false
const pointer = (navigator && window) ? (window.PointerEvent && navigator.pointerEnabled && navigator.maxTouchPoints) : msPointer

const opera = window ? window.opera : false;

const gecko = ua.indexOf("gecko") !== -1 && !webkit && !opera && !ie;
const firefox = ua.indexOf("gecko") !== -1 && !webkit && !opera && !ie;
const chrome = ua.indexOf("chrome") !== -1;
const edge = ua.indexOf("edge/") !== -1;

const ie3d = (doc) ? ie && 'transition' in doc.style : false
const webkit3d = (window) ? ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23 : false
const gecko3d = (doc) ? 'MozPerspective' in doc.style : false
const opera3d = (doc) ? 'OTransition' in doc.style : false

const any3d = window && !window.L_DISABLE_3D &&
    (ie3d || webkit3d || gecko3d || opera3d) && !phantomjs

const mobileWebkit = mobile && webkit
const mobileWebkit3d = mobile && webkit3d
const mobileOpera = mobile && window.opera

let retina = (window) ? 'devicePixelRatio' in window && window.devicePixelRatio > 1 : false

if (!retina && window && 'matchMedia' in window) {
    let media_matches = window.matchMedia('(min-resolution:144dpi)');
    retina = media_matches && media_matches.matches;
}

const touch = window &&
    !window.L_NO_TOUCH &&
    !phantomjs &&
    (pointer || 'ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch))


function orientation() {
    var w = window.innerWidth,
        h = window.innerHeight,
        _orientation = "portrait";

    if (w > h) {
        _orientation = "landscape";
    }
    if (Math.abs(window.orientation) == 90) {
        //_orientation = "landscape";
    }
    return _orientation;
}

/***/ }),

/***/ "./src/js/core/CSV.js":
/*!****************************!*\
  !*** ./src/js/core/CSV.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fetchCSV: () => (/* binding */ fetchCSV)
/* harmony export */ });
/* unused harmony exports extractFields, parse, parseObjects */
/* Adapted from okfn/csv.js under MIT license
https://github.com/okfn/csv.js/blob/master/LICENSE.txt
Copyright (c) 2011-2013 Open Knowledge Foundation

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function chomp(s, lineterminator) {

    if (s == null) return ''

    lineterminator = lineterminator || '\n'

    if (s.charAt(s.length - lineterminator.length) !== lineterminator) {
        // Does not end with \n, just return string
        return s;
    } else {
        // Remove the \n
        return s.substring(0, s.length - lineterminator.length);
    }
}

/**
 * Fetch data from a URL and parse the response as a CSV file.
 * To specify the data source, use `dataset.url`. 
 * @param {Object} dataset 
 * @returns {Promise} which invokes resolve with an array of objects of length 
 * [csv row count - 1], where the 
 * property names are determined by the first row.
 */
async function fetchCSV(dataset) {
    return new Promise((resolve, reject) => {
        if (dataset.data) {
            var out = extractFields(parse(dataset.data, dataset), dataset);
            out.useMemoryStore = true;
            resolve(out);
        } else if (dataset.url) {
            window.fetch(dataset.url, { mode: 'cors' })
                .then(function(response) {
                    if (response.status != 200) {
                        if (response.headers.get('content-type') == "application/json") {
                            response.text().then(text => {
                                reject(JSON.parse(text))
                            })
                        } else {
                            reject({
                                status_code: response.status,
                                message: `Error fetching CSV: [${response.status} ${response.statusText}]`
                            })
                        }
                        return;
                    }
                    if (response.text) {
                        return response.text();
                    } else {
                        return response;
                    }
                })
                .then(function(data) {
                    if (data) {
                        var out = parseObjects(data, dataset);
                        out.useMemoryStore = true;
                        resolve(out);
                    }
                })
                .catch(msg => {
                    reject({
                        status_code: 500,
                        message: `Error fetching CSV: ${msg}`
                    })
                    return;
                });
        }
    })
};

/**
 * Given an array of rows, split them into an object with two keys:
 * `fields` and `records`. `fields` is the first item of the array
 * and `records` is the remainder. If `noFields.noHeaderRow` is true, 
 * the returned object will not have a `fields` property and its `records`
 * property will be the entire array of input `rows`.
 * @param {Array} rows 
 * @param {Object} [noFields]
 */
function extractFields(rows, noFields) {
    noFields = noFields || {}
    if (noFields.noHeaderRow !== true && rows.length > 0) {
        return {
            fields: rows[0].map((x, i) => {
                if (x && x.trim) {
                    return x.trim()
                }
                return `untitled${i}`
            }),
            records: rows.slice(1)
        };
    } else {
        return {
            records: rows
        };
    }
};

function normalizeDialectOptions(options) {
    // note lower case compared to CSV DDF
    var out = {
        delimiter: ",",
        doublequote: true,
        lineterminator: "\n",
        quotechar: '"',
        skipinitialspace: true,
        skipinitialrows: 0
    };
    for (var key in options) {
        if (key === "trim") {
            out["skipinitialspace"] = options.trim;
        } else {
            out[key.toLowerCase()] = options[key];
        }
    }
    return out;
};

// ## parse
//
// For docs see the README
//
// Heavily based on uselesscode's JS CSV parser (MIT Licensed):
// http://www.uselesscode.org/javascript/csv/
function parse(s, dialect) {
    // When line terminator is not provided then we try to guess it
    // and normalize it across the file.
    if (!dialect || (dialect && !dialect.lineterminator)) {
        s = normalizeLineTerminator(s, dialect);
    }

    // Get rid of any trailing \n
    var options = normalizeDialectOptions(dialect);
    s = chomp(s, options.lineterminator);

    var cur = "", // The character we are currently processing.
        inQuote = false,
        fieldQuoted = false,
        field = "", // Buffer for building up the current field
        row = [],
        out = [],
        i,
        processField;

    processField = function(field) {
        if (fieldQuoted !== true) {
            // If field is empty set to null
            if (field === "") {
                field = null;
                // If the field was not quoted and we are trimming fields, trim it
            } else if (options.skipinitialspace === true) {
                field = field.trim();
            }

            // Convert unquoted numbers to their appropriate types
            // but Timeline never expects real numbers, so we'll leave that out here.
            // if (rxIsInt.test(field)) {
            //     field = parseInt(field, 10);
            // } else if (rxIsFloat.test(field)) {
            //     field = parseFloat(field, 10);
            // }
        }
        return field;
    };

    for (i = 0; i < s.length; i += 1) {
        cur = s.charAt(i);

        // If we are at a EOF or EOR
        if (
            inQuote === false &&
            (cur === options.delimiter || cur === options.lineterminator)
        ) {
            field = processField(field);
            // Add the current field to the current row
            row.push(field);
            // If this is EOR append row to output and flush row
            if (cur === options.lineterminator) {
                out.push(row);
                row = [];
            }
            // Flush the field buffer
            field = "";
            fieldQuoted = false;
        } else {
            // If it's not a quotechar, add it to the field buffer
            if (cur !== options.quotechar) {
                field += cur;
            } else {
                if (!inQuote) {
                    // We are not in a quote, start a quote
                    inQuote = true;
                    fieldQuoted = true;
                } else {
                    // Next char is quotechar, this is an escaped quotechar
                    if (s.charAt(i + 1) === options.quotechar) {
                        field += options.quotechar;
                        // Skip the next char
                        i += 1;
                    } else {
                        // It's not escaping, so end quote
                        inQuote = false;
                    }
                }
            }
        }
    }

    // Add the last field
    field = processField(field);
    row.push(field);
    out.push(row);

    // Expose the ability to discard initial rows
    if (options.skipinitialrows) out = out.slice(options.skipinitialrows);

    return out;
}

/**
 * If no lineterminator is specified in `dialect`, convert CRLF and CR 
 * to LF (newline) to simplify splitting lines.
 * @param {String} csvString - a String representation of a CSV file
 * @param {Object} [dialect] - details about the CSV dialect to guide the parser
 */
function normalizeLineTerminator(csvString, dialect) {
    if (dialect && !dialect.lineterminator) {
        return csvString.replace(/(\r\n|\n|\r)/gm, "\n");
    }
    // if not return the string untouched.
    return csvString;
}

/**
 * Given a CSV String, parse it and return it as an array of objects, one-per-row 
 * after the header row. The header is the source of object properties. Will fail 
 * unceremoniously if dialect.noHeaderRow is true
 * @param {String} s - a String representation of a CSV file
 * @param {Object} [dialect] - details about the CSV dialect to guide the parser
 */
function parseObjects(s, dialect) {
    let rows = extractFields(parse(s, dialect))
    let objects = []
    rows.records.forEach(record => {
        let obj = {}
        rows.fields.forEach((f, i) => obj[f] = record[i])
        objects.push(obj)
    })
    return objects
}

/***/ }),

/***/ "./src/js/core/ConfigFactory.js":
/*!**************************************!*\
  !*** ./src/js/core/ConfigFactory.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   jsonFromGoogleURL: () => (/* binding */ jsonFromGoogleURL),
/* harmony export */   makeConfig: () => (/* binding */ makeConfig),
/* harmony export */   parseGoogleSpreadsheetURL: () => (/* binding */ parseGoogleSpreadsheetURL)
/* harmony export */ });
/* unused harmony exports readGoogleAsCSV, makeGoogleCSVURL */
/* harmony import */ var _core_TimelineConfig__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/TimelineConfig */ "./src/js/core/TimelineConfig.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _date_TLDate__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../date/TLDate */ "./src/js/date/TLDate.js");
/* harmony import */ var _core_TLError__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/TLError */ "./src/js/core/TLError.js");
/* harmony import */ var _net_Net__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../net/Net */ "./src/js/net/Net.js");
/* harmony import */ var _date_DateUtil__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../date/DateUtil */ "./src/js/date/DateUtil.js");
/* harmony import */ var _core_CSV__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/CSV */ "./src/js/core/CSV.js");








function clean_integer(s) {
    if (s) {
        return s.replace(/[\s,]+/g, ''); // doesn't handle '.' as comma separator, but how to distinguish that from decimal separator?
    }
}

function parseGoogleSpreadsheetURL(url) {
    let parts = {
            key: null,
            worksheet: 0 // not really sure how to use this to get the feed for that sheet, so this is not ready except for first sheet right now
        }
        // key as url parameter (old-fashioned)
    var key_pat = /\bkey=([-_A-Za-z0-9]+)&?/i;
    // https://docs.google.com/spreadsheets/d/e/2PACX-1vTwrxBim-ruoMlLP9CnZIevWdP8rIatkV7XjNGXRSaMI94sNd-VbRF--W7A2kj6wfZhKUHWv1ur0Tb3/pubhtml
    var v2_url_pat = /docs.google.com\/spreadsheets.*?\/d\/e\/([^\/]+)\/.+/; // Google prefers pubhtml links with this format
    var url_pat = /docs.google.com\/spreadsheets(.*?)\/d\//; // fixing issue of URLs with u/0/d

    if (url.match(key_pat)) {
        parts.key = url.match(key_pat)[1];
        // can we get a worksheet from this form?
    } else if (url.match(v2_url_pat)) {
        let v2_key = url.match(v2_url_pat)[1]
        parts.key = `v2:${v2_key}`
        // to do: get worksheet from this form?
    } else if (url.match(url_pat)) {
        var pos = url.search(url_pat) + url.match(url_pat)[0].length;
        var tail = url.substr(pos);
        parts.key = tail.split('/')[0]
        if (url.match(/\?gid=(\d+)/)) {
            parts.worksheet = url.match(/\?gid=(\d+)/)[1];
        }
    } else if (url.match(/^\b(v2:)?[-_A-Za-z0-9]+$/)) {
        parts.key = url;
    }

    if (parts.key) {
        return parts;
    } else {
        return null;
    }
}


function interpretBackground(bkgd) {
    if (typeof(bkgd) != 'string') return ''
    if (bkgd.match(/^(https?:)?\/\/?/)) { // support http, https, protocol relative, site relative
        return { 'url': bkgd }
    } else { // for now we'll trust it's a color
        return { 'color': bkgd }
    }

}

function extractEventFromCSVObject(orig_row) {

    let row = {}
    Object.keys(orig_row).forEach(k => {
        row[k] = (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.trim)(orig_row[k]) // get rid of white-space and reduce all-blank cells to empty strings
    })

    var d = {
        media: {
            caption: row['Media Caption'] || '',
            credit: row['Media Credit'] || '',
            url: row['Media'] || '',
            thumbnail: row['Media Thumbnail'] || '',
            alt: row['Alt Text'] || ''
        },
        text: {
            headline: row['Headline'] || '',
            text: row['Text'] || ''
        },
        display_date: row['Display Date'] || '', // only in v3 but no problem
        group: row['Group'] || row['Tag'] || '', // small diff between v1 and v3 sheets
        background: interpretBackground(row['Background']), // only in v3 but no problem
        type: row['Type'] || ''
    }

    // ADD LEVEL SUPPORT HERE
    if (row['Level']) {
        d.level = parseInt(row['Level']);
    }
    
    if (Object.keys(row).includes('Start Date') || Object.keys(row).includes('End Date')) {
        // V1 date handling
        if (row['Start Date']) {
            d.start_date = (0,_date_TLDate__WEBPACK_IMPORTED_MODULE_2__.parseDate)(row['Start Date'])
        }
        if (row['End Date']) {
            d.end_date = (0,_date_TLDate__WEBPACK_IMPORTED_MODULE_2__.parseDate)(row['End Date'])
        }
    } else {
        // V3 date handling
        // every date must have at least a year to be valid.
        if (row['Year']) {
            d.start_date = {
                year: clean_integer(row['Year']),
                month: clean_integer(row['Month']) || '',
                day: clean_integer(row['Day']) || ''
            }
        }
        if (row['End Year']) {
            d.end_date = {
                year: clean_integer(row['End Year']) || '',
                month: clean_integer(row['End Month']) || '',
                day: clean_integer(row['End Day']) || ''
            }
        }

        if (row['Time']) {
            if (d.start_date) {
                (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.mergeData)(d.start_date, (0,_date_DateUtil__WEBPACK_IMPORTED_MODULE_5__.parseTime)(row['Time']));
            } else {
                throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("invalid_start_time_without_date")
            }
        }

        if (row['End Time']) {
            if (d.end_date) {
                (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.mergeData)(d.end_date, (0,_date_DateUtil__WEBPACK_IMPORTED_MODULE_5__.parseTime)(row['End Time']));
            } else {
                throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("invalid_end_time_without_date")
            }
        }

        if (d.start_date && !(0,_date_DateUtil__WEBPACK_IMPORTED_MODULE_5__.validDateConfig)(d.start_date)) {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("invalid_date_err")
        }

        if (d.end_date && !(0,_date_DateUtil__WEBPACK_IMPORTED_MODULE_5__.validDateConfig)(d.end_date)) {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("invalid_date_err")
        }


    }

    return d
}

/**
 * Given a Google Sheets URL (or mere document ID), read the data and return
 * a Timeline JSON file suitable for instantiating a timeline.
 * 
 * @param {string} url 
 */
async function readGoogleAsCSV(url, sheets_proxy) {

    let rows = []

    url = makeGoogleCSVURL(url)
    let error = null;

    await (0,_core_CSV__WEBPACK_IMPORTED_MODULE_6__.fetchCSV)({
        url: `${sheets_proxy}${url}`,
    }).then(d => {
        rows = d;
    }).catch(error_json => {
        if (error_json.proxy_err_code == 'response_not_csv') {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]('Timeline could not read the data for your timeline. Make sure you have published it to the web.')
        } else if (error_json.status_code == 401) {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]('Configuration unreadable. Please make sure your Google Sheets document is published to the web and review step 2 of the timeline setup instructions to make sure you have the correct URL, as this has changed.')
        } else if (error_json.status_code == 410) {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]('Google reports that this configuration spreadsheet is gone. Check to see if it has been deleted from Google Drive. Timeline configuration spreadsheets must not be deleted.')
        }
        let msg = "undefined error"
        if (Array.isArray(error_json.message)) {
            msg = error_json.message.join('<br>')
        } else {
            msg = String(error_json.message)
        }
        throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"](msg)
    })

    let timeline_config = { 'events': [], 'errors': [], 'warnings': [], 'eras': [] }

    rows.forEach((row, i) => {
        try {
            if (!(0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.isEmptyObject)(row)) {
                let event = extractEventFromCSVObject(row)
                handleRow(event, timeline_config)
            }
        } catch (e) {
            if (e.constructor == _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]) {
                timeline_config.errors.push(e);
            } else {
                if (e.message) {
                    e = e.message;
                }
                let label = row['Headline'] || i
                timeline_config.errors.push(e + `[${label}]`);
            }
        }
    });

    return timeline_config
}
/**
 * Given a Google Sheets URL or a bare spreadsheet key, return a URL expected
 * to retrieve a CSV file, assuming the Sheets doc has been "published to the web".
 * No checking for the actual availability is done.
 * @param {string} url_or_key 
 */
function makeGoogleCSVURL(url_or_key) {
    url_or_key = url_or_key.trim()
    if (url_or_key.match(/^v2:[a-zA-Z0-9-_]+$/)) {
        console.log(`it's a newbie: ${url_or_key}`)
        try {
            let key = url_or_key.substring(3)
            console.log(`key is ${key}`)
            let url = `https://docs.google.com/spreadsheets/d/e/${key}/pub?output=csv`
            console.log(`url is ${url}`)
            return url
        } catch (e) {
            debugger;
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]('invalid_url_err', url_or_key);
        }
    } else if (url_or_key.match(/^[a-zA-Z0-9-_]+$/)) {
        // key pattern from https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id
        return `https://docs.google.com/spreadsheets/d/${url_or_key}/pub?output=csv`
    }

    if (url_or_key.startsWith('https://docs.google.com/spreadsheets/')) {
        if (url_or_key.match(/\/pub\?output=csv$/)) return url_or_key
        let parsed = new URL(url_or_key)
        let params = new URLSearchParams(parsed.search)
        params.set('output', 'csv')
        if (params.get('gid')) {
            params.set('single', 'true')
        }
        parsed.search = `?${params.toString()}`
        let base_path = parsed.pathname.substr(0, parsed.pathname.lastIndexOf('/'))
        parsed.pathname = `${base_path}/pub`
        return parsed.toString()
    }
    throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]('invalid_url_err', url_or_key);
}

var buildGoogleFeedURL = function(key, api_version) {
    if (api_version == 'v4') {
        return "https://sheets.googleapis.com/v4/spreadsheets/" + key + "/values/A1:R1000?key=AIzaSyCInR0kjJJ2Co6aQAXjLBQ14CEHam3K0xg";
    } else {
        return "https://spreadsheets.google.com/feeds/list/" + key + "/1/public/values?alt=json";
    }
}

async function jsonFromGoogleURL(google_url, options) {

    if (!options['sheets_proxy']) {
        throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("Proxy option must be set to read data from Google")
    }

    var timeline_json = await readGoogleAsCSV(google_url, options['sheets_proxy']);

    if (timeline_json) {
        return timeline_json;
    }
}

/**
 * Using the given URL, fetch or create a JS Object suitable for configuring a timeline. Use 
 * that to create a TimelineConfig, and invoke the callback with that object as its argument. 
 * If the second argument is an object instead of a callback function, it must have a 
 * 'callback' property which will be invoked with the config.
 * Even in error cases, a minimal TimelineConfig object will be created and passed to the callback
 * so that error messages can be displayed in the host page.
 * 
 * @param {String} url the URL or Google Spreadsheet key which can be used to get configuration information
 * @param {function|object} callback_or_options either a callback function or an object with a 'callback' property and other configuration properties
 */
async function makeConfig(url, callback_or_options) {

    let callback = null,
        options = {};
    if (typeof(callback_or_options) == 'function') {
        callback = callback_or_options
    } else if (typeof(callback_or_options) == 'object') {
        options = callback_or_options
        callback = callback_or_options['callback']
        if (typeof(options['callback']) == 'function') callback = options['callback']
    }

    if (!callback) {
        throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("Second argument to makeConfig must be either a function or an object which includes a 'callback' property with a 'function' type value")
    }

    var tc,
        json,
        key = parseGoogleSpreadsheetURL(url);

    if (key) {
        try {
            console.log(`reading url ${url}`);
            json = await jsonFromGoogleURL(url, options);
        } catch (e) {
            // even with an error, we make 
            // a TimelineConfig because it's 
            // the most straightforward way to display messages
            // in the DOM
            tc = new _core_TimelineConfig__WEBPACK_IMPORTED_MODULE_0__.TimelineConfig();
            if (e.name == 'NetworkError') {
                tc.logError(new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("network_err"));
            } else if (e.name == 'TLError') {
                tc.logError(e);
            } else {
                tc.logError(new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("unknown_read_err", e.name));
            }
            callback(tc);
            return; // don't process further if there were errors
        }

        tc = new _core_TimelineConfig__WEBPACK_IMPORTED_MODULE_0__.TimelineConfig(json);
        if (json.errors) {
            for (var i = 0; i < json.errors.length; i++) {
                tc.logError(json.errors[i]);
            };
        }
        callback(tc);
    } else {
        (0,_net_Net__WEBPACK_IMPORTED_MODULE_4__.ajax)({
            url: url,
            dataType: 'json',
            success: function(data) {
                try {
                    tc = new _core_TimelineConfig__WEBPACK_IMPORTED_MODULE_0__.TimelineConfig(data);
                } catch (e) {
                    tc = new _core_TimelineConfig__WEBPACK_IMPORTED_MODULE_0__.TimelineConfig();
                    tc.logError(e);
                }
                callback(tc);
            },
            error: function(xhr, errorType, error) {
                tc = new _core_TimelineConfig__WEBPACK_IMPORTED_MODULE_0__.TimelineConfig();
                if (errorType == 'parsererror') {
                    var error = new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("invalid_url_err");
                } else {
                    var error = new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("unknown_read_err", errorType)
                }
                tc.logError(error);
                callback(tc);
            }
        });

    }
}

function handleRow(event, timeline_config) {
    var row_type = 'event';
    if (typeof(event.type) != 'undefined') {
        row_type = event.type;
        delete event.type;
    }
    if (row_type == 'title') {
        if (!timeline_config.title) {
            timeline_config.title = event;
        } else {
            timeline_config.warnings.push("Multiple title slides detected.");
            timeline_config.events.push(event);
        }
    } else if (row_type == 'era') {
        timeline_config.eras.push(event);
    } else {
        timeline_config.events.push(event);
    }
}


/***/ }),

/***/ "./src/js/core/Events.js":
/*!*******************************!*\
  !*** ./src/js/core/Events.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Events)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_TLError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/TLError */ "./src/js/core/TLError.js");
/*	Events
	adds custom events functionality to TL classes
================================================== */




class Events {

    /**
     * Add an event listener callback for the given type.
     * @param {string} type 
     * @param {function} fn 
     * @param {object} [context] 
     * @returns { Events } this (the instance upon which the method was called)
     */
    on(type, fn, context) {
        if (!fn) {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_1__["default"]("No callback function provided")
        }
        var events = this._tl_events = this._tl_events || {};
        events[type] = events[type] || [];
        events[type].push({
            action: fn,
            context: context || this
        });
        return this;
    }

    /**
     * Synonym for on(type, fn, context). It would be great to determine 
     *     that this is obsolete, but that wasn't clear.
     * @param {string} type
     * @param {function} fn
     * @param {object} [context]
     * @returns { Events } this (the instance upon which the method was called)
     */
    addEventListener( /*String*/ type, /*Function*/ fn, /*(optional) Object*/ context) {
        return this.on(type, fn, context)
    }

    /**
     * Return true if this object has any listeners of the given type.
     * @param {string} type 
     * @returns {boolean}
     */
    hasEventListeners(type) {
        var k = '_tl_events';
        return (k in this) && (type in this[k]) && (this[k][type].length > 0);
    }

    /**
     * Remove any event listeners for the given type that use the given 
     *     callback and have the given context.
     * @param {string} type 
     * @param {function} fn 
     * @param {object} context 
     * @returns { Events } this (the instance upon which the method was called)
     */
    removeEventListener( /*String*/ type, /*Function*/ fn, /*(optional) Object*/ context) {
        if (!this.hasEventListeners(type)) {
            return this;
        }

        for (var i = 0, events = this._tl_events, len = events[type].length; i < len; i++) {
            if (
                (events[type][i].action === fn) &&
                (!context || (events[type][i].context === context))
            ) {
                events[type].splice(i, 1);
                return this;
            }
        }
        return this;
    }

    /**
     * Synonym for removeEventListener. Is this really needed? While 'off' is opposite of 'on',
     *     it doesn't actually read as 'remove' unless you know that.
     * @param {string} type
     * @param {function} fn
     * @param {object} context
     * @returns { Events } this (the instance upon which the method was called)
     */
    off(type, fn, context) {
        return this.removeEventListener(type, fn, context)
    }

    /**
     * Activate (execute) all registered callback functions for the given
     *     type, passing the given data, if any.
     * @param {string} type 
     * @param {object} [data] 
     * @returns { Events } this (the instance upon which the method was called)
     */
    fire(type, data) {
        if (!this.hasEventListeners(type)) {
            return this;
        }

        var event = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)({
            type: type,
            target: this
        }, data);

        var listeners = this._tl_events[type].slice();

        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i].action) {
                listeners[i].action.call(listeners[i].context || this, event);
            } else {
                (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)(`no action defined for ${type} listener`)
            }
        }

        return this;
    }

};

/***/ }),

/***/ "./src/js/core/Load.js":
/*!*****************************!*\
  !*** ./src/js/core/Load.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadCSS: () => (/* binding */ loadCSS),
/* harmony export */   loadJS: () => (/* binding */ loadJS)
/* harmony export */ });
/*	Load
  Loads External Javascript and CSS
  Adapted from LazyLoad and adjusted from earlier TimelineJS to
  not add an extra layer.  Seems like we could simplify
  this, but leaving in in case users need support for older browsers.
  ================================================== */

/*
LazyLoad makes it easy and painless to lazily load one or more external
JavaScript or CSS files on demand either during or after the rendering of a web
page.

Supported browsers include Firefox 2+, IE6+, Safari 3+ (including Mobile
Safari), Google Chrome, and Opera 9+. Other browsers may or may not work and
are not officially supported.

Visit https://github.com/rgrove/lazyload/ for more info.

Copyright (c) 2011 Ryan Grove <ryan@wonko.com>
All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
class Loader {

    constructor(document) {
        this.doc = document
        this.pending = {}
        this.queue = { css: [], js: [] };
        this.styleSheets = document.styleSheets
        this.env = this.getEnv()
        this.head = this.doc.head || this.doc.getElementsByTagName('head')[0];
        this.pollCount = 0

    }



    // -- Private Methods --------------------------------------------------------

    /**
    Creates and returns an HTML element with the specified name and attributes.

    @method createNode
    @param {String} name element name
    @param {Object} attrs name/value mapping of element attributes
    @return {HTMLElement}
    @private
    */
    createNode(name, attrs) {
        var node = this.doc.createElement(name),
            attr;

        for (attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                node.setAttribute(attr, attrs[attr]);
            }
        }

        return node;
    }

    /**
    Called when the current pending resource of the specified type has finished
    loading. Executes the associated callback (if any) and loads the next
    resource in the queue.

    @method finish
    @param {String} type resource type ('css' or 'js')
    @private
    */
    finish(type) {
        var p = this.pending[type],
            callback,
            urls;

        if (p) {
            callback = p.callback;
            urls = p.urls;

            urls.shift();
            this.pollCount = 0;

            // If this is the last of the pending URLs, execute the callback and
            // start the next request in the queue (if any).
            if (!urls.length) {
                callback && callback.call(p.context, p.obj);
                this.pending[type] = null;
                this.queue[type].length && this.load(type);
            }
        }
    }

    /**
    Populates the <code>env</code> variable with user agent and feature test
    information.

    @method getEnv
    @private
    */
    getEnv() {
        var ua = navigator.userAgent;

        var env = {
            // True if this browser supports disabling async mode on dynamically
            // created script nodes. See
            // http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
            async: this.doc.createElement('script').async === true
        };

        (env.webkit = /AppleWebKit\//.test(ua)) ||
        (env.ie = /MSIE/.test(ua)) ||
        (env.opera = /Opera/.test(ua)) ||
        (env.gecko = /Gecko\//.test(ua)) ||
        (env.unknown = true);

        return env;
    }

    /**
    Loads the specified resources, or the next resource of the specified type
    in the queue if no resources are specified. If a resource of the specified
    type is already being loaded, the new request will be queued until the
    first request has been finished.

    When an array of resource URLs is specified, those URLs will be loaded in
    parallel if it is possible to do so while preserving execution order. All
    browsers support parallel loading of CSS, but only Firefox and Opera
    support parallel loading of scripts. In other browsers, scripts will be
    queued and loaded one at a time to ensure correct execution order.

    @method load
    @param {String} type resource type ('css' or 'js')
    @param {String|Array} urls (optional) URL or array of URLs to load
    @param {Function} callback (optional) callback function to execute when the
      resource is loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function will
      be executed in this object's context
    @private
    */
    load(type, urls, callback, obj, context) {
        var _finish = function() { this.finish(type); }.bind(this),
            isCSS = type === 'css',
            nodes = [],
            i, len, node, p, pendingUrls, url;



        if (urls) {
            // If urls is a string, wrap it in an array. Otherwise assume it's an
            // array and create a copy of it so modifications won't be made to the
            // original.
            urls = typeof urls === 'string' ? [urls] : urls.concat();

            // Create a request object for each URL. If multiple URLs are specified,
            // the callback will only be executed after all URLs have been loaded.
            //
            // Sadly, Firefox and Opera are the only browsers capable of loading
            // scripts in parallel while preserving execution order. In all other
            // browsers, scripts must be loaded sequentially.
            //
            // All browsers respect CSS specificity based on the order of the link
            // elements in the DOM, regardless of the order in which the stylesheets
            // are actually downloaded.
            if (isCSS || this.env.async || this.env.gecko || this.env.opera) {
                // Load in parallel.
                this.queue[type].push({
                    urls: urls,
                    callback: callback,
                    obj: obj,
                    context: context
                });
            } else {
                // Load sequentially.
                for (i = 0, len = urls.length; i < len; ++i) {
                    this.queue[type].push({
                        urls: [urls[i]],
                        callback: i === len - 1 ? callback : null, // callback is only added to the last URL
                        obj: obj,
                        context: context
                    });
                }
            }
        }

        // If a previous load request of this type is currently in progress, we'll
        // wait our turn. Otherwise, grab the next item in the queue.
        if (this.pending[type] || !(p = this.pending[type] = this.queue[type].shift())) {
            return;
        }


        pendingUrls = p.urls;

        for (i = 0, len = pendingUrls.length; i < len; ++i) {
            url = pendingUrls[i];

            if (isCSS) {
                node = this.env.gecko ? this.createNode('style') : this.createNode('link', {
                    href: url,
                    rel: 'stylesheet'
                });
            } else {
                node = this.createNode('script', { src: url });
                node.async = false;
            }

            node.className = 'lazyload';
            node.setAttribute('charset', 'utf-8');

            if (this.env.ie && !isCSS) {
                node.onreadystatechange = function() {
                    if (/loaded|complete/.test(node.readyState)) {
                        node.onreadystatechange = null;
                        _finish();
                    }
                };
            } else if (isCSS && (this.env.gecko || this.env.webkit)) {
                // Gecko and WebKit don't support the onload event on link nodes.
                if (this.env.webkit) {
                    // In WebKit, we can poll for changes to document.styleSheets to
                    // figure out when stylesheets have loaded.
                    p.urls[i] = node.href; // resolve relative URLs (or polling won't work)
                    this.pollWebKit();
                } else {
                    // In Gecko, we can import the requested URL into a <style> node and
                    // poll for the existence of node.sheet.cssRules. Props to Zach
                    // Leatherman for calling my attention to this technique.
                    node.innerHTML = '@import "' + url + '";';
                    this.pollGecko(node);
                }
            } else {
                node.onload = node.onerror = _finish;
            }

            nodes.push(node);
        }

        for (i = 0, len = nodes.length; i < len; ++i) {
            this.head.appendChild(nodes[i]);
        }
    }

    /**
    Begins polling to determine when the specified stylesheet has finished loading
    in Gecko. Polling stops when all pending stylesheets have loaded or after 10
    seconds (to prevent stalls).

    Thanks to Zach Leatherman for calling my attention to the @import-based
    cross-domain technique used here, and to Oleg Slobodskoi for an earlier
    same-domain implementation. See Zach's blog for more details:
    http://www.zachleat.com/web/2010/07/29/load-css-dynamically/

    @method pollGecko
    @param {HTMLElement} node Style node to poll.
    @private
    */
    pollGecko(node) {
        var hasRules;

        try {
            // We don't really need to store this value or ever refer to it again, but
            // if we don't store it, Closure Compiler assumes the code is useless and
            // removes it.
            hasRules = !!node.sheet.cssRules;
        } catch (ex) {
            // An exception means the stylesheet is still loading.
            this.pollCount += 1;

            if (this.pollCount < 200) {
                var self = this;
                setTimeout(function() { self.pollGecko(node); }, 50);
            } else {
                // We've been polling for 10 seconds and nothing's happened. Stop
                // polling and finish the pending requests to avoid blocking further
                // requests.
                hasRules && this.finish('css');
            }

            return;
        }

        // If we get here, the stylesheet has loaded.
        this.finish('css');
    }

    /**
    Begins polling to determine when pending stylesheets have finished loading
    in WebKit. Polling stops when all pending stylesheets have loaded or after 10
    seconds (to prevent stalls).

    @method pollWebKit
    @private
    */
    pollWebKit() {
        var css = this.pending.css,
            i;

        if (css) {
            i = this.styleSheets.length;

            // Look for a stylesheet matching the pending URL.
            while (--i >= 0) {
                if (this.styleSheets[i].href === css.urls[0]) {
                    this.finish('css');
                    break;
                }
            }

            this.pollCount += 1;

            if (css) {
                if (this.pollCount < 200) {
                    setTimeout(this.pollWebKit.bind(this), 50);
                } else {
                    // We've been polling for 10 seconds and nothing's happened, which may
                    // indicate that the stylesheet has been removed from the document
                    // before it had a chance to load. Stop polling and finish the pending
                    // request to prevent blocking further requests.
                    this.finish('css');
                }
            }
        }
    }

    /**
    Requests the specified CSS URL or URLs and executes the specified
    callback (if any) when they have finished loading. If an array of URLs is
    specified, the stylesheets will be loaded in parallel and the callback
    will be executed after all stylesheets have finished loading.

    @method css
    @param {String|Array} urls CSS URL or array of CSS URLs to load
    @param {Function} callback (optional) callback function to execute when
      the specified stylesheets are loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function
      will be executed in this object's context
    @static
    */
    css(urls, callback, obj, context) {
        this.load('css', urls, callback, obj, context);
    }

    /**
    Requests the specified JavaScript URL or URLs and executes the specified
    callback (if any) when they have finished loading. If an array of URLs is
    specified and the browser supports it, the scripts will be loaded in
    parallel and the callback will be executed after all scripts have
    finished loading.

    Currently, only Firefox and Opera support parallel loading of scripts while
    preserving execution order. In other browsers, scripts will be
    queued and loaded one at a time to ensure correct execution order.

    @method js
    @param {String|Array} urls JS URL or array of JS URLs to load
    @param {Function} callback (optional) callback function to execute when
      the specified scripts are loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function
      will be executed in this object's context
    @static
    */
    js(urls, callback, obj, context) {
        this.load('js', urls, callback, obj, context);
    }
}

function loadJS(urls, callback, obj, context) {
    loader.js(urls, callback, obj, context)
}

function loadCSS(urls, callback, obj, context) {
    loader.css(urls, callback, obj, context)
}


// this seems fragile but not sure how else to inject the document
// besides 
let loader = new Loader(document)



/***/ }),

/***/ "./src/js/core/TLClass.js":
/*!********************************!*\
  !*** ./src/js/core/TLClass.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TLClass: () => (/* binding */ TLClass)
/* harmony export */ });
/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Util */ "./src/js/core/Util.js");
/*	TLClass
	Class powers the OOP facilities of the library.
================================================== */



let TLClass = function () {};

TLClass.extend = function (/*Object*/ props) /*-> Class*/ {
 
	// extended class with the new prototype
	var NewClass = function () {
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}
	};

	// instantiate class without calling constructor
	var F = function () {};
	F.prototype = this.prototype;
	var proto = new F();

	proto.constructor = NewClass;
	NewClass.prototype = proto;

	// add superclass access
	NewClass.superclass = this.prototype;

	// add class name
	//proto.className = props;

	//inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype' && i !== 'superclass') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		(0,_Util__WEBPACK_IMPORTED_MODULE_0__.extend)(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		_Util__WEBPACK_IMPORTED_MODULE_0__.extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (props.options && proto.options) {
		props.options = (0,_Util__WEBPACK_IMPORTED_MODULE_0__.extend)({}, proto.options, props.options);
	}

	// mix given properties into the prototype
	(0,_Util__WEBPACK_IMPORTED_MODULE_0__.extend)(proto, props);

	// allow inheriting further
	NewClass.extend = TLClass.extend;

	// method for adding properties to prototype
	NewClass.include = function (props) {
		(0,_Util__WEBPACK_IMPORTED_MODULE_0__.extend)(this.prototype, props);
	};

	return NewClass;
};




/***/ }),

/***/ "./src/js/core/TLError.js":
/*!********************************!*\
  !*** ./src/js/core/TLError.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TLError)
/* harmony export */ });
/* Timeline Error class */
class TLError extends Error {
    constructor(message_key, detail) {
        super()
        this.name = 'TLError';
        this.message = message_key || 'error';
        this.message_key = this.message;
        this.detail = detail || '';
    }
}


/***/ }),

/***/ "./src/js/core/TimelineConfig.js":
/*!***************************************!*\
  !*** ./src/js/core/TimelineConfig.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimelineConfig: () => (/* binding */ TimelineConfig)
/* harmony export */ });
/* harmony import */ var _date_DateUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../date/DateUtil */ "./src/js/date/DateUtil.js");
/* harmony import */ var _date_TLDate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../date/TLDate */ "./src/js/date/TLDate.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_TLError__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/TLError */ "./src/js/core/TLError.js");
/* harmony import */ var dompurify__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! dompurify */ "./node_modules/dompurify/dist/purify.es.mjs");






const SANITIZE_FIELDS = {
    text: ['headline', 'text'],
    media: ['caption', 'credit'] // media "URL" must be sanitized in Media classes to avoid messing up URLs
}

const STRIP_MARKUP_FIELDS = {
    start_date: ['display_date'],
    end_date: ['display_date'],
    slide: ['display_date', 'group'],
    date: ['display_date']

}

/**
 * After sanitizing, make sure all <a> tags with 'href' attributes that 
 * don't have a target attribute are set to open in a new ('_blank') 
 * window. Also make sure that all <a> tags which are set to open in a '_blank'
 * window set `rel="noopener"`
 */
dompurify__WEBPACK_IMPORTED_MODULE_4__["default"].addHook('afterSanitizeAttributes', function(node) {

    if (node.nodeName == 'A' && 'href' in node) {
        if (!('target' in node.attributes)) {
            node.setAttribute('target', '_blank');
        }
        let rel = node.attributes['rel']
        if (!rel) {
            node.setAttribute('rel', 'noopener');
        } else {
            if (rel.value.indexOf('noopener') == -1) {
                node.setAttribute('rel', `noopener ${rel.value}`)
            }
        }
    }
});

function _process_fields(slide, callback, fieldmap) {
    Object.keys(fieldmap).forEach(k => {
        var to_sanitize = (k == 'slide') ? slide : slide[k]
        if (to_sanitize) {
            fieldmap[k].forEach(i => {
                if (typeof(to_sanitize[i]) != 'undefined') {
                    to_sanitize[i] = callback(to_sanitize[i])
                }
            })
        }
    })

}

/**
 * Centralize use of HTML sanitizer so that we can enforce common
 * rules. Maybe we would want to push this to Util and unit test
 * but ultimately we're trusting the creators of the library.
 * @param {string} txt 
 */
function _tl_sanitize(txt) {
    return dompurify__WEBPACK_IMPORTED_MODULE_4__["default"].sanitize(txt, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['frameborder', 'target'],
    })
}

class TimelineConfig {
    constructor(data) {
        this.title = '';
        this.scale = '';
        this.events = [];
        this.eras = [];
        this.event_dict = {}; // despite name, all slides (events + title) indexed by slide.unique_id
        this.messages = {
            errors: [],
            warnings: []
        };

        // Initialize the data
        if (typeof data === 'object' && data.events) {
            this.scale = data.scale;
            this.events = [];
            this._ensureValidScale(data.events);

            if (data.title) {
                // the 'title' is a kind of slide, one without a date
                var title_id = this._assignID(data.title);
                this._tidyFields(data.title);
                this.title = data.title;
                this.event_dict[title_id] = this.title;
            }

            for (var i = 0; i < data.events.length; i++) {
                try {
                    this.addEvent(data.events[i], true);
                } catch (e) {
                    this.logError(e);
                }
            }

            if (data.eras) {
                data.eras.forEach((era_data, indexOf) => {
                    try {
                        this.addEra(era_data)
                    } catch (e) {
                        this.logError("Era " + indexOf + ": " + e);
                    }
                })
            }

            (0,_date_DateUtil__WEBPACK_IMPORTED_MODULE_0__.sortByDate)(this.events);
            (0,_date_DateUtil__WEBPACK_IMPORTED_MODULE_0__.sortByDate)(this.eras);

        }
    }

    logError(msg) {
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.trace)(`logError: ${msg}`);
        this.messages.errors.push(msg);
    }

    /*
     * Return any accumulated error messages. If `sep` is passed, it should be a string which will be used to join all messages, resulting in a string return value. Otherwise,
     * errors will be returned as an array.
     */
    getErrors(sep) {
        if (sep) {
            return this.messages.errors.join(sep);
        } else {
            return this.messages.errors;
        }
    }


    /*
     * Perform any sanity checks we can before trying to use this to make a timeline. Returns nothing, but errors will be logged
     * such that after this is called, one can test `this.isValid()` to see if everything is OK.
     */
    validate() {
        if (typeof(this.events) == "undefined" || typeof(this.events.length) == "undefined" || this.events.length == 0) {
            this.logError("Timeline configuration has no events. Common causes for this: changing/erasing 'Year' from the A1 cell, or having 'era' in all non-title 'type' cells.")
        }

        // make sure all eras have start and end dates
        for (var i = 0; i < this.eras.length; i++) {
            if (typeof(this.eras[i].start_date) == 'undefined' || typeof(this.eras[i].end_date) == 'undefined') {
                var era_identifier;
                if (this.eras[i].headline) {
                    era_identifier = this.eras[i].headline
                } else {
                    era_identifier = "era " + (i + 1);
                }
                this.logError("All eras must have start and end dates. [" + era_identifier + "]") // add internationalization (I18N) and context
            }
        };
    }


    /**
     * @returns {boolean} whether or not this config has logged errors.  
     */
    isValid() {
        return this.messages.errors.length == 0;
    }

    /* Add an event (including cleaning/validation) and return the unique id.
     * All event data validation should happen in here.
     * Throws: TLError for any validation problems.
     */
    addEvent(data, defer_sort) {
        var event_id = this._assignID(data);

        if (typeof(data.start_date) == 'undefined') {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.trace)("Missing start date, skipping event")
            console.log(data)
            return null
        }

        this._processDates(data);
        this._tidyFields(data);

        this.events.push(data);
        this.event_dict[event_id] = data;

        if (!defer_sort) {
            (0,_date_DateUtil__WEBPACK_IMPORTED_MODULE_0__.sortByDate)(this.events);
        }
        return event_id;
    }

    addEra(data) {
        var event_id = this._assignID(data);

        if (typeof(data.start_date) == 'undefined') {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("missing_start_date_err", event_id);
        }

        this._processDates(data);
        this._tidyFields(data);

        this.eras.push({
            start_date: data.start_date,
            end_date: data.end_date,
            headline: data.text.headline
        });
    }

    /**
     * Given a slide, verify that its ID is unique, or assign it one which is.
     * The assignment happens in this function, and the assigned ID is also
     * the return value. Not thread-safe, because ids are not reserved
     * when assigned here.
     */
    _assignID(slide) {
        var slide_id = slide.unique_id;
        if (!(0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.trim)(slide_id)) {
            // give it an ID if it doesn't have one
            slide_id = (slide.text) ? (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.slugify)(slide.text.headline) : null;
        }
        // make sure it's unique and add it.
        slide.unique_id = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.ensureUniqueKey)(this.event_dict, slide_id);
        return slide.unique_id
    }

    /**
     * Given an array of slide configs (the events), ensure that each one has a distinct unique_id. The id of the title
     * is also passed in because in most ways it functions as an event slide, and the event IDs must also all be unique
     * from the title ID.
     */
    _makeUniqueIdentifiers(title_id, array) {
        var used = [title_id];

        // establish which IDs are assigned and if any appear twice, clear out successors.
        for (var i = 0; i < array.length; i++) {
            if ((0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.trim)(array[i].unique_id)) {
                array[i].unique_id = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.slugify)(array[i].unique_id); // enforce valid
                if (used.indexOf(array[i].unique_id) == -1) {
                    used.push(array[i].unique_id);
                } else { // it was already used, wipe it out
                    array[i].unique_id = '';
                }
            }
        };

        if (used.length != (array.length + 1)) {
            // at least some are yet to be assigned
            for (var i = 0; i < array.length; i++) {
                if (!array[i].unique_id) {
                    // use the headline for the unique ID if it's available
                    var slug = (array[i].text) ? (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.slugify)(array[i].text.headline) : null;
                    if (!slug) {
                        slug = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.unique_ID)(6); // or generate a random ID
                    }
                    if (used.indexOf(slug) != -1) {
                        slug = slug + '-' + i; // use the index to get a unique ID.
                    }
                    used.push(slug);
                    array[i].unique_id = slug;
                }
            }
        }
    }

    _ensureValidScale(events) {
            if (!this.scale) {
                this.scale = "human"; // default to human unless there's a slide which is explicitly 'cosmological' or one which has a cosmological year

                for (var i = 0; i < events.length; i++) {
                    if (events[i].scale == 'cosmological') {
                        this.scale = 'cosmological';
                        break;
                    }
                    if (events[i].start_date && typeof(events[i].start_date.year) != "undefined") {
                        var d = new _date_TLDate__WEBPACK_IMPORTED_MODULE_1__.BigDate(events[i].start_date);
                        var year = d.data.date_obj.year;
                        if (year < -271820 || year > 275759) {
                            this.scale = "cosmological";
                            break;
                        }
                    }
                }
                (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.trace)(`Determining scale dynamically: ${this.scale}`);
            }
            var dateCls = _date_DateUtil__WEBPACK_IMPORTED_MODULE_0__.SCALE_DATE_CLASSES[this.scale];
            if (!dateCls) { this.logError("Don't know how to process dates on scale " + this.scale); }
        }
        /*
            Given a thing which has a start_date and optionally an end_date, make sure that it is an instance
                of the correct date class (for human or cosmological scale). For slides, remove redundant end dates
                (people frequently configure an end date which is the same as the start date).
            */
    _processDates(slide_or_era) {
            var dateCls = _date_DateUtil__WEBPACK_IMPORTED_MODULE_0__.SCALE_DATE_CLASSES[this.scale];
            if (!(slide_or_era.start_date instanceof dateCls)) {
                var start_date = slide_or_era.start_date;
                slide_or_era.start_date = new dateCls(start_date);

                // eliminate redundant end dates.
                if (typeof(slide_or_era.end_date) != 'undefined' && !(slide_or_era.end_date instanceof dateCls)) {
                    var end_date = slide_or_era.end_date;
                    var equal = true;
                    for (let property in start_date) {
                        equal = equal && (start_date[property] == end_date[property]);
                    }
                    if (equal) {
                        (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.trace)("End date same as start date is redundant; dropping end date");
                        delete slide_or_era.end_date;
                    } else {
                        slide_or_era.end_date = new dateCls(end_date);
                    }

                }
            }

        }
        /**
         * Return the earliest date that this config knows about, whether it's a slide or an era
         */
    getEarliestDate() {
            // counting that dates were sorted in initialization
            var date = this.events[0].start_date;
            if (this.eras && this.eras.length > 0) {
                if (this.eras[0].start_date.isBefore(date)) {
                    return this.eras[0].start_date;
                }
            }
            return date;

        }
        /**
         * Return the latest date that this config knows about, whether it's a slide or an era, taking end_dates into account.
         */
    getLatestDate() {
        var dates = [];
        for (var i = 0; i < this.events.length; i++) {
            if (this.events[i].end_date) {
                dates.push({ date: this.events[i].end_date });
            } else {
                dates.push({ date: this.events[i].start_date });
            }
        }
        for (var i = 0; i < this.eras.length; i++) {
            if (this.eras[i].end_date) {
                dates.push({ date: this.eras[i].end_date });
            } else {
                dates.push({ date: this.eras[i].start_date });
            }
        }
        (0,_date_DateUtil__WEBPACK_IMPORTED_MODULE_0__.sortByDate)(dates, 'date');
        return dates.slice(-1)[0].date;
    }

    /**
     * Do some simple cleanup for all slides and eras, including sanitizing 
     * HTML input, or stripping markup for fields which are not intended to support
     * it.
     * @param { Slide | TimeEra } slide 
     */
    _tidyFields(slide) {

        function fillIn(obj, key, default_value) {
            if (!default_value) default_value = '';
            if (!obj.hasOwnProperty(key)) { obj[key] = default_value }
        }

        if (slide.group) {
            slide.group = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.trim)(slide.group);
        }

        if (!slide.text) {
            slide.text = {};
        }
        fillIn(slide.text, 'text');
        fillIn(slide.text, 'headline');

        _process_fields(slide, _tl_sanitize, SANITIZE_FIELDS)
            // handle media.url separately
        _process_fields(slide, _core_Util__WEBPACK_IMPORTED_MODULE_2__.stripMarkup, STRIP_MARKUP_FIELDS)

    }
}


/***/ }),

/***/ "./src/js/core/Util.js":
/*!*****************************!*\
  !*** ./src/js/core/Util.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addTraceHandler: () => (/* binding */ addTraceHandler),
/* harmony export */   base58: () => (/* binding */ base58),
/* harmony export */   classMixin: () => (/* binding */ classMixin),
/* harmony export */   ensureUniqueKey: () => (/* binding */ ensureUniqueKey),
/* harmony export */   extend: () => (/* binding */ extend),
/* harmony export */   findArrayNumberByUniqueID: () => (/* binding */ findArrayNumberByUniqueID),
/* harmony export */   findNextGreater: () => (/* binding */ findNextGreater),
/* harmony export */   findNextLesser: () => (/* binding */ findNextLesser),
/* harmony export */   getObjectAttributeByIndex: () => (/* binding */ getObjectAttributeByIndex),
/* harmony export */   getParamString: () => (/* binding */ getParamString),
/* harmony export */   getUrlVars: () => (/* binding */ getUrlVars),
/* harmony export */   hexToRgb: () => (/* binding */ hexToRgb),
/* harmony export */   htmlify: () => (/* binding */ htmlify),
/* harmony export */   isEmptyObject: () => (/* binding */ isEmptyObject),
/* harmony export */   isEven: () => (/* binding */ isEven),
/* harmony export */   isTrue: () => (/* binding */ isTrue),
/* harmony export */   linkify: () => (/* binding */ linkify),
/* harmony export */   mergeData: () => (/* binding */ mergeData),
/* harmony export */   pad: () => (/* binding */ pad),
/* harmony export */   parseYouTubeTime: () => (/* binding */ parseYouTubeTime),
/* harmony export */   ratio: () => (/* binding */ ratio),
/* harmony export */   setData: () => (/* binding */ setData),
/* harmony export */   slugify: () => (/* binding */ slugify),
/* harmony export */   stamp: () => (/* binding */ stamp),
/* harmony export */   stripMarkup: () => (/* binding */ stripMarkup),
/* harmony export */   trace: () => (/* binding */ trace),
/* harmony export */   transformMediaURL: () => (/* binding */ transformMediaURL),
/* harmony export */   trim: () => (/* binding */ trim),
/* harmony export */   unhtmlify: () => (/* binding */ unhtmlify),
/* harmony export */   unique_ID: () => (/* binding */ unique_ID),
/* harmony export */   unlinkify: () => (/* binding */ unlinkify)
/* harmony export */ });
/* unused harmony exports rgbToHex, maxDepth */
/* harmony import */ var _core_TLError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/TLError */ "./src/js/core/TLError.js");


const css_named_colors = {
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aqua": "#00ffff",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "black": "#000000",
    "blanchedalmond": "#ffebcd",
    "blue": "#0000ff",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgreen": "#006400",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "fuchsia": "#ff00ff",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "gray": "#808080",
    "green": "#008000",
    "greenyellow": "#adff2f",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred": "#cd5c5c",
    "indigo": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgray": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370db",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "navy": "#000080",
    "oldlace": "#fdf5e6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#db7093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "purple": "#800080",
    "rebeccapurple": "#663399",
    "red": "#ff0000",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "silver": "#c0c0c0",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "white": "#ffffff",
    "whitesmoke": "#f5f5f5",
    "yellow": "#ffff00",
    "yellowgreen": "#9acd32"
}

function intToHexString(i) {
    return pad(parseInt(i, 10).toString(16));
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    if (css_named_colors[hex.toLowerCase()]) {
        hex = css_named_colors[hex.toLowerCase()];
    }
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
// given an object with r, g, and b keys, or a string of the form 'rgb(mm,nn,ll)', return a CSS hex string including the leading '#' character
function rgbToHex(rgb) {
    var r, g, b;
    if (typeof(rgb) == 'object') {
        r = rgb.r;
        g = rgb.g;
        b = rgb.b;
    } else if (typeof(rgb.match) == 'function') {
        var parts = rgb.match(/^rgb\((\d+),(\d+),(\d+)\)$/);
        if (parts) {
            r = parts[1];
            g = parts[2];
            b = parts[3];
        }
    }
    if (isNaN(r) || isNaN(b) || isNaN(g)) {
        throw new _core_TLError__WEBPACK_IMPORTED_MODULE_0__["default"]("invalid_rgb_err");
    }
    return "#" + intToHexString(r) + intToHexString(g) + intToHexString(b);
}

function mergeData(data_main, data_to_merge) {
    var x;
    for (x in data_to_merge) {
        if (Object.prototype.hasOwnProperty.call(data_to_merge, x)) {
            data_main[x] = data_to_merge[x];
        }
    }
    return data_main;
}

function isTrue(s) {
    if (s == null) return false;
    return s == true || String(s).toLowerCase() == 'true' || Number(s) == 1;
}

// like mergeData but takes an arbitrarily long list of sources to merge.
function extend( /*Object*/ dest) /*-> Object*/ { // merge src properties into dest
    var sources = Array.prototype.slice.call(arguments, 1);
    for (var j = 0, len = sources.length, src; j < len; j++) {
        src = sources[j] || {};
        mergeData(dest, src);
    }
    return dest;
}

const TRACE_HANDLERS = []

/**
 * Register a callback to be executed when trace is called in this runtime.
 * Callbacks will be called with whatever was passed to `trace` which is 
 * expected to be a string.
 * @param {callable} cb 
 */
function addTraceHandler(cb) {
    TRACE_HANDLERS.push(cb)
}


/**
 * Pass the given `msg` to each registered trace handler.
 * This is a crude adaptation of the original Timeline trace
 * function which assumed access to a global `debug` flag.
 * 
 * @param {string} msg 
 */
function trace(msg) {
    TRACE_HANDLERS.forEach((cb) => {
        try {
            cb(msg)
        } catch (e) {
            if (console && console.log) {
                console.log("Error handling trace", e)
            }
        }
    })
}


function pad(val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len) val = "0" + val;
    return val;
}

const stamp = (function() {
    var lastId = 0,
        key = '_tl_id';

    return function( /*Object*/ obj) {
        obj[key] = obj[key] || ++lastId;
        return obj[key];
    };
}())

/**
 * Remove any leading or trailing whitespace from the given string.
 * If `str` is undefined or does not have a `replace` function, return
 * an empty string.
 */
function trim(str) {
    if (str && typeof(str.replace) == 'function') {
        return str.replace(/^\s+|\s+$/g, '');
    }
    return "";
}

function maxDepth(ary) {
    // given a sorted array of 2-tuples of numbers, count how many "deep" the items are.
    // that is, what is the maximum number of tuples that occupy any one moment
    // each tuple should also be sorted
    var stack = [];
    var max_depth = 0;
    for (var i = 0; i < ary.length; i++) {

        stack.push(ary[i]);
        if (stack.length > 1) {
            var top = stack[stack.length - 1]
            var bottom_idx = -1;
            for (var j = 0; j < stack.length - 1; j++) {
                if (stack[j][1] < top[0]) {
                    bottom_idx = j;
                }
            };
            if (bottom_idx >= 0) {
                stack = stack.slice(bottom_idx + 1);
            }

        }

        if (stack.length > max_depth) {
            max_depth = stack.length;
        }
    };
    return max_depth;
}

/**
 * Implement mixin behavior. Based on 
 *     https://blog.bitsrc.io/understanding-mixins-in-javascript-de5d3e02b466
 * @param {class} cls 
 * @param  {...class} src 
 */
function classMixin(cls, ...src) {
    for (let _cl of src) {
        for (var key of Object.getOwnPropertyNames(_cl.prototype)) {
            cls.prototype[key] = _cl.prototype[key]
        }
    }
}

function ensureUniqueKey(obj, candidate) {
    if (!candidate) { candidate = unique_ID(6); }

    if (!(candidate in obj)) { return candidate; }

    var root = candidate.match(/^(.+)(-\d+)?$/)[1];
    var similar_ids = [];
    // get an alternative
    for (let key in obj) {
        if (key.match(/^(.+?)(-\d+)?$/)[1] == root) {
            similar_ids.push(key);
        }
    }
    candidate = root + "-" + (similar_ids.length + 1);

    for (var counter = similar_ids.length; similar_ids.indexOf(candidate) != -1; counter++) {
        candidate = root + '-' + counter;
    }

    return candidate;
}

function isEmptyObject(o) {
    var properties = []
    if (Object.keys) {
        properties = Object.keys(o);
    } else { // all this to support IE 8
        for (var p in o)
            if (Object.prototype.hasOwnProperty.call(o, p)) properties.push(p);
    }
    for (var i = 0; i < properties.length; i++) {
        var k = properties[i];
        if (o[k] != null && typeof o[k] != "string") return false;
        if (trim(o[k]).length != 0) return false;
    }
    return true;
}

function slugify(str) {
    // borrowed from http://stackoverflow.com/a/5782563/102476
    str = trim(str);
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
    var to = "aaaaaeeeeeiiiiooooouuuunc------";
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    str = str.replace(/^([0-9])/, '_$1');
    return str;
}

function unique_ID(size, prefix) {

    var getRandomNumber = function(range) {
        return Math.floor(Math.random() * range);
    };

    var getRandomChar = function() {
        var chars = "abcdefghijklmnopqurstuvwxyz";
        return chars.substr(getRandomNumber(32), 1);
    };

    var randomID = function(size) {
        var str = "";
        for (var i = 0; i < size; i++) {
            str += getRandomChar();
        }
        return str;
    };

    if (prefix) {
        return prefix + "-" + randomID(size);
    } else {
        return "tl-" + randomID(size);
    }
}

function findNextGreater(list, current, default_value) {
    // given a sorted list and a current value which *might* be in the list,
    // return the next greatest value if the current value is >= the last item in the list, return default,
    // or if default is undefined, return input value
    for (var i = 0; i < list.length; i++) {
        if (current < list[i]) {
            return list[i];
        }
    }

    return (default_value) ? default_value : current;
}

function findNextLesser(list, current, default_value) {
    // given a sorted list and a current value which *might* be in the list,
    // return the next lesser value if the current value is <= the last item in the list, return default,
    // or if default is undefined, return input value
    for (var i = list.length - 1; i >= 0; i--) {
        if (current > list[i]) {
            return list[i];
        }
    }

    return (default_value) ? default_value : current;
}

function isEven(n) {
    return n == parseFloat(n) ? !(n % 2) : void 0;
}

function findArrayNumberByUniqueID(id, array, prop, defaultVal) {
    var _n = defaultVal || 0;

    for (var i = 0; i < array.length; i++) {
        if (array[i].data[prop] == id) {
            _n = i;
        }
    };

    return _n;
}

function unlinkify(text) {
    if (!text) return text;
    text = text.replace(/<a\b[^>]*>/i, "");
    text = text.replace(/<\/a>/i, "");
    return text;
}

function setData(obj, data) {
    obj.data = extend({}, obj.data, data);
    if (obj.data.unique_id === "") {
        obj.data.unique_id = unique_ID(6);
    }
}

function htmlify(str) {
    //if (str.match(/<\s*p[^>]*>([^<]*)<\s*\/\s*p\s*>/)) {
    if (str.match(/<p>[\s\S]*?<\/p>/)) {

        return str;
    } else {
        return "<p>" + str + "</p>";
    }
}

function unhtmlify(str) {
    str = str.replace(/(<[^>]*>)+/g, '');
    return str.replace('"', "'");
}

/*	* Turns plain text links into real links
================================================== */
function linkify(text, targets, is_touch) {

    var make_link = function(url, link_text, prefix) {
            if (!prefix) {
                prefix = "";
            }
            var MAX_LINK_TEXT_LENGTH = 30;
            if (link_text && link_text.length > MAX_LINK_TEXT_LENGTH) {
                link_text = link_text.substring(0, MAX_LINK_TEXT_LENGTH) + "\u2026"; // unicode ellipsis
            }
            return prefix + "<a class='tl-makelink' href='" + url + "' onclick='void(0)'>" + link_text + "</a>";
        }
        // http://, https://, ftp://
    var urlPattern = /\b(?:https?|ftp):\/\/([a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|])/gim;

    // www. sans http:// or https://
    var pseudoUrlPattern = /(^|[^\/>])(www\.[\S]+(\b|$))/gim;

    // Email addresses
    var emailAddressPattern = /([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/gim;


    return text
        .replace(urlPattern, function(match, url_sans_protocol, offset, string) {
            // Javascript doesn't support negative lookbehind assertions, so
            // we need to handle risk of matching URLs in legit hrefs
            if (offset > 0) {
                var prechar = string[offset - 1];
                if (prechar == '"' || prechar == "'" || prechar == "=") {
                    return match;
                }
            }
            return make_link(match, url_sans_protocol);
        })
        .replace(pseudoUrlPattern, function(match, beforePseudo, pseudoUrl, offset, string) {
            return make_link('http://' + pseudoUrl, pseudoUrl, beforePseudo);
        })
        .replace(emailAddressPattern, function(match, email, offset, string) {
            return make_link('mailto:' + email, email);
        });
}

/**
 * Try to make seamless the process of interpreting a URL to a web page which embeds an image for sharing purposes
 * as a direct image link. Some services have predictable transformations we can use rather than explain to people
 * this subtlety.
 */
function transformMediaURL(url) {
    return url.replace(/(.*)www.dropbox.com\/(.*)/, '$1dl.dropboxusercontent.com/$2')
}

const ratio = {
    square: (size) => {
        var s = {
            w: 0,
            h: 0
        }
        if (size.w > size.h && size.h > 0) {
            s.h = size.h;
            s.w = size.h;
        } else {
            s.w = size.w;
            s.h = size.w;
        }
        return s;
    },
    r16_9: (size) => {
        if (size.w !== null && size.w !== "") {
            return Math.round((size.w / 16) * 9);
        } else if (size.h !== null && size.h !== "") {
            return Math.round((size.h / 9) * 16);
        } else {
            return 0;
        }
    },
    r4_3: (size) => {
        if (size.w !== null && size.w !== "") {
            return Math.round((size.w / 4) * 3);
        } else if (size.h !== null && size.h !== "") {
            return Math.round((size.h / 3) * 4);
        }
    }
}

function getUrlVars(string) {
    var str,
        vars = [],
        hash,
        hashes;

    str = string.toString();

    if (str.match('&#038;')) {
        str = str.replace("&#038;", "&");
    } else if (str.match('&#38;')) {
        str = str.replace("&#38;", "&");
    } else if (str.match('&amp;')) {
        str = str.replace("&amp;", "&");
    }

    hashes = str.slice(str.indexOf('?') + 1).split('&');

    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }


    return vars;
}

function getParamString(obj) {
    var params = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            params.push(i + '=' + obj[i]);
        }
    }
    return '?' + params.join('&');
}

function getObjectAttributeByIndex(obj, index) {
    if (typeof obj != 'undefined') {
        var i = 0;
        for (var attr in obj) {
            if (index === i) {
                return obj[attr];
            }
            i++;
        }
        return "";
    } else {
        return "";
    }

}

let base58 = (function(alpha) {
    var alphabet = alpha || '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ',
        base = alphabet.length;
    return {
        encode: function(enc) {
            if (typeof enc !== 'number' || enc !== parseInt(enc))
                throw '"encode" only accepts integers.';
            var encoded = '';
            while (enc) {
                var remainder = enc % base;
                enc = Math.floor(enc / base);
                encoded = alphabet[remainder].toString() + encoded;
            }
            return encoded;
        },
        decode: function(dec) {
            if (typeof dec !== 'string')
                throw '"decode" only accepts strings.';
            var decoded = 0;
            while (dec) {
                var alphabetPosition = alphabet.indexOf(dec[0]);
                if (alphabetPosition < 0)
                    throw '"decode" can\'t find "' + dec[0] + '" in the alphabet: "' + alphabet + '"';
                var powerOf = dec.length - 1;
                decoded += alphabetPosition * (Math.pow(base, powerOf));
                dec = dec.substring(1);
            }
            return decoded;
        }
    };
})()




function parseYouTubeTime(s) {
    // given a YouTube start time string in a reasonable format, reduce it to a number of seconds as an integer.
    if (typeof(s) == 'string') {
        let parts = s.match(/^\s*(\d+h)?(\d+m)?(\d+s)?\s*/i);
        if (parts) {
            var hours = parseInt(parts[1]) || 0;
            var minutes = parseInt(parts[2]) || 0;
            var seconds = parseInt(parts[3]) || 0;
            return seconds + (minutes * 60) + (hours * 60 * 60);
        }
    } else if (typeof(s) == 'number') {
        return s;
    }
    return 0;
}

function stripMarkup(txt) {
    var doc = new DOMParser().parseFromString(txt, 'text/html');
    return doc.body.textContent || "";
}

/***/ }),

/***/ "./src/js/date/DateUtil.js":
/*!*********************************!*\
  !*** ./src/js/date/DateUtil.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SCALE_DATE_CLASSES: () => (/* binding */ SCALE_DATE_CLASSES),
/* harmony export */   parseTime: () => (/* binding */ parseTime),
/* harmony export */   sortByDate: () => (/* binding */ sortByDate),
/* harmony export */   validDateConfig: () => (/* binding */ validDateConfig)
/* harmony export */ });
/* harmony import */ var _core_TLError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/TLError */ "./src/js/core/TLError.js");
/* harmony import */ var _date_TLDate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../date/TLDate */ "./src/js/date/TLDate.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");





function sortByDate(array, prop_name) { // only for use with slide data objects
    var prop_name = prop_name || 'start_date';
    array.sort(function(a, b) {
        if (a[prop_name].isBefore(b[prop_name])) return -1;
        if (a[prop_name].isAfter(b[prop_name])) return 1;
        return 0;
    });
}

function parseTime(time_str) {
    var parsed = {
        hour: null,
        minute: null,
        second: null,
        millisecond: null // conform to keys in TLDate
    }
    var period = null;
    var match = time_str.match(/(\s*[AaPp]\.?[Mm]\.?\s*)$/);
    if (match) {
        period = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.trim)(match[0]);
        time_str = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.trim)(time_str.substring(0, time_str.lastIndexOf(period)));
    }

    var parts = [];
    var no_separators = time_str.match(/^\s*(\d{1,2})(\d{2})\s*$/);
    if (no_separators) {
        parts = no_separators.slice(1);
    } else {
        parts = time_str.split(':');
        if (parts.length == 1) {
            parts = time_str.split('.');
        }
    }

    if (parts.length > 4) {
        throw new _core_TLError__WEBPACK_IMPORTED_MODULE_0__["default"]("invalid_separator_error");
    }
    let hour_part = parts[0]
    parsed.hour = parseInt(hour_part);

    if (period && period.toLowerCase()[0] == 'p' && parsed.hour != 12) {
        parsed.hour += 12;
    } else if (period && period.toLowerCase()[0] == 'a' && parsed.hour == 12) {
        parsed.hour = 0;
    }


    if (isNaN(parsed.hour) || parsed.hour < 0 || parsed.hour > 23) {
        throw new _core_TLError__WEBPACK_IMPORTED_MODULE_0__["default"]("invalid_hour_err", hour_part);
    }

    if (parts.length > 1) {
        let minute_part = parts[1]
        parsed.minute = parseInt(minute_part);
        if (isNaN(parsed.minute)) {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_0__["default"]("invalid_minute_err", minute_part);
        }
    }

    if (parts.length > 2) {
        var sec_parts = parts[2].split(/[\.,]/);
        parts = sec_parts.concat(parts.slice(3)) // deal with various methods of specifying fractional seconds
        if (parts.length > 2) {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_0__["default"]("invalid_second_fractional_err");
        }
        parsed.second = parseInt(parts[0]);
        if (isNaN(parsed.second)) {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_0__["default"]("invalid_second_err", parts[0]);
        }
        if (parts.length == 2) {
            var frac_secs = parseInt(parts[1]);
            if (isNaN(frac_secs)) {
                throw new _core_TLError__WEBPACK_IMPORTED_MODULE_0__["default"]("invalid_fractional_err", parts[1]);
            }
            parsed.millisecond = 100 * frac_secs;
        }
    }

    return parsed;
}

const VALID_INTEGER_PATTERN = new RegExp('(^-?\\d+$|^$)')

function validDateConfig(d) {

    try {
        Object.keys(d).forEach(k => {
            let v = d[k]
            if (v && v.match) {
                if (!v.match(VALID_INTEGER_PATTERN)) {
                    throw `invalid value ${v} for ${k}`
                }
            }
        })
        return true;
    } catch (error) {
        return false;
    }
}


const SCALE_DATE_CLASSES = {
    human: _date_TLDate__WEBPACK_IMPORTED_MODULE_1__.TLDate,
    cosmological: _date_TLDate__WEBPACK_IMPORTED_MODULE_1__.BigDate
}

/***/ }),

/***/ "./src/js/date/TLDate.js":
/*!*******************************!*\
  !*** ./src/js/date/TLDate.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BIG_DATE_SCALES: () => (/* binding */ BIG_DATE_SCALES),
/* harmony export */   BigDate: () => (/* binding */ BigDate),
/* harmony export */   BigYear: () => (/* binding */ BigYear),
/* harmony export */   SCALES: () => (/* binding */ SCALES),
/* harmony export */   TLDate: () => (/* binding */ TLDate),
/* harmony export */   parseDate: () => (/* binding */ parseDate)
/* harmony export */ });
/* unused harmony export makeDate */
/* harmony import */ var _core_TLClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/TLClass */ "./src/js/core/TLClass.js");
/* harmony import */ var _language_Language__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../language/Language */ "./src/js/language/Language.js");
/* harmony import */ var _core_TLError__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/TLError */ "./src/js/core/TLError.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/*	Date
	Date object
	MONTHS are 1-BASED, not 0-BASED (different from Javascript date objects)
================================================== */






//
// Class for human dates
//

const SCALES = [
    // ( name, units_per_tick, flooring function )
    ["millisecond", 1, function(d) {}],
    [
        "second",
        1000,
        function(d) {
            d.setMilliseconds(0);
        }
    ],
    [
        "minute",
        1000 * 60,
        function(d) {
            d.setSeconds(0);
        }
    ],
    [
        "hour",
        1000 * 60 * 60,
        function(d) {
            d.setMinutes(0);
        }
    ],
    [
        "day",
        1000 * 60 * 60 * 24,
        function(d) {
            d.setHours(0);
        }
    ],
    [
        "month",
        1000 * 60 * 60 * 24 * 30,
        function(d) {
            d.setDate(1);
        }
    ],
    [
        "year",
        1000 * 60 * 60 * 24 * 365,
        function(d) {
            d.setMonth(0);
        }
    ],
    [
        "decade",
        1000 * 60 * 60 * 24 * 365 * 10,
        function(d) {
            var real_year = d.getFullYear();
            d.setFullYear(real_year - (real_year % 10));
        }
    ],
    [
        "century",
        1000 * 60 * 60 * 24 * 365 * 100,
        function(d) {
            var real_year = d.getFullYear();
            d.setFullYear(real_year - (real_year % 100));
        }
    ],
    [
        "millennium",
        1000 * 60 * 60 * 24 * 365 * 1000,
        function(d) {
            var real_year = d.getFullYear();
            d.setFullYear(real_year - (real_year % 1000));
        }
    ]
]

// Date parts from highest to lowest precision
const DATE_PARTS = [
    "millisecond",
    "second",
    "minute",
    "hour",
    "day",
    "month",
    "year"
];

const ISO8601_SHORT_PATTERN = /^([\+-]?\d+?)(-\d{2}?)?(-\d{2}?)?$/;

// regex below from
// http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
const ISO8601_PATTERN = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;

/* For now, rather than extract parts from regexp, lets trust the browser.
 * Famous last words...
 * What about UTC vs local time?
 * see also http://stackoverflow.com/questions/10005374/ecmascript-5-date-parse-results-for-iso-8601-test-cases
 */
function parseISODate(str) {
    var d = new Date(str); // this is a true JavaScript date, not a TLDate
    if (isNaN(d)) {
        throw new _core_TLError__WEBPACK_IMPORTED_MODULE_2__["default"]("invalid_date_err", str);
    }
    return {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
        hour: d.getHours(),
        minute: d.getMinutes(),
        second: d.getSeconds(),
        millisecond: d.getMilliseconds()
    };
};


const BEST_DATEFORMATS = {
    base: {
        millisecond: "time_short",
        second: "time",
        minute: "time_no_seconds_small_date",
        hour: "time_no_seconds_small_date",
        day: "full",
        month: "month",
        year: "year",
        decade: "year",
        century: "year",
        millennium: "year",
        age: "fallback",
        epoch: "fallback",
        era: "fallback",
        eon: "fallback",
        eon2: "fallback"
    },

    short: {
        millisecond: "time_short",
        second: "time_short",
        minute: "time_no_seconds_short",
        hour: "time_no_minutes_short",
        day: "full_short",
        month: "month_short",
        year: "year",
        decade: "year",
        century: "year",
        millennium: "year",
        age: "fallback",
        epoch: "fallback",
        era: "fallback",
        eon: "fallback",
        eon2: "fallback"
    }
};

const TLDate = _core_TLClass__WEBPACK_IMPORTED_MODULE_0__.TLClass.extend({
    // @data = ms, JS Date object, or JS dictionary with date properties
    initialize: function(data, format, format_short) {
        if (typeof data == "number") {
            this.data = {
                format: "yyyy mmmm",
                date_obj: new Date(data)
            };
        } else if (Date == data.constructor) {
            this.data = {
                format: "yyyy mmmm",
                date_obj: data
            };
        } else {
            this.data = JSON.parse(JSON.stringify(data)); // clone don't use by reference.
            this._createDateObj();
        }

        if (data.format && !format) {
            format = data.format
        }
        this._setFormat(format, format_short);
    },

    setDateFormat: function(format) {
        this.data.format = format;
    },
    /**
     * Return a string representation of this date. If this date has been created with a `display_date` property,
     * that value is always returned, regardless of arguments to the method invocation. Otherwise,
     * the given `Language` is asked to create a string representation based on this Date's data, passing through the provided
     * `format` String, or, if that is undefined, this date's default format string.
     * @param {Language} language
     * @param {String} format
     * @returns {String} formattedDate
     */
    getDisplayDate: function(language, format) {
        if (this.data.display_date) {
            return this.data.display_date;
        }
        if (!language) {
            language = _language_Language__WEBPACK_IMPORTED_MODULE_1__.Language.fallback;
        }
        if (language.constructor != _language_Language__WEBPACK_IMPORTED_MODULE_1__.Language) {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.trace)(
                "First argument to getDisplayDate must be type Language"
            );
            language = _language_Language__WEBPACK_IMPORTED_MODULE_1__.Language.fallback;
        }

        var format_key = format || this.data.format;
        return language.formatDate(this.data.date_obj, format_key);
    },

    getMillisecond: function() {
        return this.getTime();
    },

    getTime: function() {
        return this.data.date_obj.getTime();
    },

    isBefore: function(other_date) {
        if (!this.data.date_obj.constructor ==
            other_date.data.date_obj.constructor
        ) {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_2__["default"]("date_compare_err"); // but should be able to compare 'cosmological scale' dates once we get to that...
        }
        if ("isBefore" in this.data.date_obj) {
            return this.data.date_obj["isBefore"](
                other_date.data.date_obj
            );
        }
        return this.data.date_obj < other_date.data.date_obj;
    },

    isAfter: function(other_date) {
        if (!this.data.date_obj.constructor ==
            other_date.data.date_obj.constructor
        ) {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_2__["default"]("date_compare_err"); // but should be able to compare 'cosmological scale' dates once we get to that...
        }
        if ("isAfter" in this.data.date_obj) {
            return this.data.date_obj["isAfter"](
                other_date.data.date_obj
            );
        }
        return this.data.date_obj > other_date.data.date_obj;
    },

    // Return a new TLDate which has been 'floored' at the given scale.
    // @scale = string value from SCALES
    floor: function(scale) {
        var d = new Date(this.data.date_obj.getTime());
        for (var i = 0; i < SCALES.length; i++) {
            // for JS dates, we iteratively apply flooring functions
            SCALES[i][2](d);
            if (SCALES[i][0] == scale) return new TLDate(d);
        }

        throw new _core_TLError__WEBPACK_IMPORTED_MODULE_2__["default"]("invalid_scale_err", scale);
    },

    /*	Private Methods
	================================================== */

    _getDateData: function() {
        var _date = {
            year: 0,
            month: 1, // stupid JS dates
            day: 1,
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
        };

        // Merge data
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.mergeData)(_date, this.data);

        // Make strings into numbers
        for (var ix in DATE_PARTS) {
            var x = (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.trim)(_date[DATE_PARTS[ix]]);
            if (!x.match(/^-?\d*$/)) {
                throw new _core_TLError__WEBPACK_IMPORTED_MODULE_2__["default"](
                    "invalid_date_err",
                    DATE_PARTS[ix] + " = '" + _date[DATE_PARTS[ix]] + "'"
                );
            }

            var parsed = parseInt(_date[DATE_PARTS[ix]]);
            if (isNaN(parsed)) {
                parsed = ix == 4 || ix == 5 ? 1 : 0; // month and day have diff baselines
            }
            _date[DATE_PARTS[ix]] = parsed;
        }

        if (_date.month > 0 && _date.month <= 12) {
            // adjust for JS's weirdness
            _date.month = _date.month - 1;
        }

        return _date;
    },

    _createDateObj: function() {
        var _date = this._getDateData();
        this.data.date_obj = new Date(
            _date.year,
            _date.month,
            _date.day,
            _date.hour,
            _date.minute,
            _date.second,
            _date.millisecond
        );
        if (this.data.date_obj.getFullYear() != _date.year) {
            // Javascript has stupid defaults for two-digit years
            this.data.date_obj.setFullYear(_date.year);
        }
    },

    /*  Find Best Format
     * this may not work with 'cosmologic' dates, or with TLDate if we
     * support constructing them based on JS Date and time
    ================================================== */
    findBestFormat: function(variant) {
        var eval_array = DATE_PARTS,
            format = "";

        for (var i = 0; i < eval_array.length; i++) {
            if (this.data[eval_array[i]]) {
                if (variant) {
                    if (!(variant in BEST_DATEFORMATS)) {
                        variant = "short"; // legacy
                    }
                } else {
                    variant = "base";
                }
                return BEST_DATEFORMATS[variant][eval_array[i]];
            }
        }
        return "";
    },
    _setFormat: function(format, format_short) {
        if (format) {
            this.data.format = format;
        } else if (!this.data.format) {
            this.data.format = this.findBestFormat();
        }

        if (format_short) {
            this.data.format_short = format_short;
        } else if (!this.data.format_short) {
            this.data.format_short = this.findBestFormat(true);
        }
    },
    /**
     * Get the year-only representation of this date. Ticks need this to layout
     * the time axis, and this needs to work isomorphically for TLDate and BigDate 
     * @returns {Number}
     */
    getFullYear: function() {
        return this.data.date_obj.getFullYear()
    }
});

// offer something that can figure out the right date class to return
function makeDate(data) {
    var date = new TLDate(data);
    if (!isNaN(date.getTime())) {
        return date;
    }
    return new BigDate(data);
}

function parseDate(str) {
    if (str.match(ISO8601_SHORT_PATTERN)) {
        // parse short specifically to avoid timezone offset confusion
        // most browsers assume short is UTC, not local time.
        var parts = str.match(ISO8601_SHORT_PATTERN).slice(1);
        var d = { year: parts[0].replace("+", "") }; // year can be negative
        if (parts[1]) {
            d["month"] = parts[1].replace("-", "");
        }
        if (parts[2]) {
            d["day"] = parts[2].replace("-", "");
        }
        return d;
    }

    if (str.match(ISO8601_PATTERN)) {
        return cls.parseISODate(str);
    }

    if (str.match(/^\-?\d+$/)) {
        return { year: str };
    }

    var parsed = {};
    if (str.match(/\d+\/\d+\/\d+/)) {
        // mm/yy/dddd
        var date = str.match(/\d+\/\d+\/\d+/)[0];
        str = (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.trim)(str.replace(date, ""));
        var date_parts = date.split("/");
        parsed.month = date_parts[0];
        parsed.day = date_parts[1];
        parsed.year = date_parts[2];
    }

    if (str.match(/\d+\/\d+/)) {
        // mm/yy
        var date = str.match(/\d+\/\d+/)[0];
        str = (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.trim)(str.replace(date, ""));
        var date_parts = date.split("/");
        parsed.month = date_parts[0];
        parsed.year = date_parts[1];
    }

    if (str.match(":")) {
        var time_parts = str.split(":");
        parsed.hour = time_parts[0];
        parsed.minute = time_parts[1];
        if (time_parts[2]) {
            let second_parts = time_parts[2].split(".");
            parsed.second = second_parts[0];
            parsed.millisecond = second_parts[1];
        }
    }
    return parsed;
};

const BigYear = _core_TLClass__WEBPACK_IMPORTED_MODULE_0__.TLClass.extend({
    initialize: function(year) {
        this.year = parseInt(year);
        if (isNaN(this.year)) {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_2__["default"]("invalid_year_err", year);
        }
    },

    isBefore: function(that) {
        return this.year < that.year;
    },

    isAfter: function(that) {
        return this.year > that.year;
    },

    getTime: function() {
        return this.year;
    }
});


//
// Class for cosmological dates
//

// cosmo units are years, not millis
const AGE = 1000000;
const EPOCH = AGE * 10;
const ERA = EPOCH * 10;
const EON = ERA * 10;

function Floorer(unit) {
    return function(a_big_year) {
        var year = a_big_year.getTime();
        return new BigYear(Math.floor(year / unit) * unit);
    }
}

// cosmological scales
const BIG_DATE_SCALES = [ // ( name, units_per_tick, flooring function )
    ['year', 1, new Floorer(1)],
    ['decade', 10, new Floorer(10)],
    ['century', 100, new Floorer(100)],
    ['millennium', 1000, new Floorer(1000)],
    ['age', AGE, new Floorer(AGE)], // 1M years
    ['epoch', EPOCH, new Floorer(EPOCH)], // 10M years
    ['era', ERA, new Floorer(ERA)], // 100M years
    ['eon', EON, new Floorer(EON)] // 1B years
];


const BigDate = TLDate.extend({
    // @data = BigYear object or JS dictionary with date properties
    initialize: function(data, format, format_short) {
        if (BigYear == data.constructor) {
            this.data = {
                date_obj: data
            };
        } else {
            this.data = JSON.parse(JSON.stringify(data));
            this._createDateObj();
        }

        if (data.format && !format) {
            format = data.format
        }

        this._setFormat(format, format_short);
    },

    // Create date_obj
    _createDateObj: function() {
        var _date = this._getDateData();
        this.data.date_obj = new BigYear(_date.year);
    },

    // Return a new BigDate which has been 'floored' at the given scale.
    // @scale = string value from BIG_DATE_SCALES
    floor: function(scale) {
        for (var i = 0; i < BIG_DATE_SCALES.length; i++) {
            if (BIG_DATE_SCALES[i][0] == scale) {
                var floored = BIG_DATE_SCALES[i][2](this.data.date_obj);
                return new BigDate(floored);
            }
        }

        throw new _core_TLError__WEBPACK_IMPORTED_MODULE_2__["default"]("invalid_scale_err", scale);
    },
    /**
     * Get the year-only representation of this date. Ticks need this to layout
     * the time axis, and this needs to work isomorphically for TLDate and BigDate 
     * @returns {Number}
     */
    getFullYear: function() {
        return this.data.date_obj.getTime()
    }
});

/***/ }),

/***/ "./src/js/dom/DOM.js":
/*!***************************!*\
  !*** ./src/js/dom/DOM.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   create: () => (/* binding */ create),
/* harmony export */   createButton: () => (/* binding */ createButton),
/* harmony export */   get: () => (/* binding */ get),
/* harmony export */   getPosition: () => (/* binding */ getPosition)
/* harmony export */ });
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Browser */ "./src/js/core/Browser.js");


function get (id) {
	return (typeof id === 'string' ? document.getElementById(id) : id);
}

function getByClass(id) {
	if (id) {
		return document.getElementsByClassName(id);
	}
}

function create(tagName, className, container) {
	var el = document.createElement(tagName);
	el.className = className;
	if (container) {
		container.appendChild(el);
	}
	return el;
}

function createButton(className, container) {
	var el = create('button', className, container);
	el.type = 'button';
	return el;
}

function createText(content, container) {
	var el = document.createTextNode(content);
	if (container) {
		container.appendChild(el);
	}
	return el;
}

function getTranslateString(point) {
	return TRANSLATE_OPEN +
			point.x + 'px,' + point.y + 'px' +
			TRANSLATE_CLOSE;
}

function setPosition(el, point) {
	el._tl_pos = point;
	if (_core_Browser__WEBPACK_IMPORTED_MODULE_0__.webkit3d) {
		el.style[TRANSFORM] =  getTranslateString(point);

		if (_core_Browser__WEBPACK_IMPORTED_MODULE_0__.android) {
			el.style['-webkit-perspective'] = '1000';
			el.style['-webkit-backface-visibility'] = 'hidden';
		}
	} else {
		el.style.left = point.x + 'px';
		el.style.top = point.y + 'px';
	}
}

function getPosition(el){
	var pos = {
		x: 0,
		y: 0
	}
	while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
		pos.x += el.offsetLeft// - el.scrollLeft;
		pos.y += el.offsetTop// - el.scrollTop;
		el = el.offsetParent;
	}
	return pos;
}

function testProp(props) {
	var style = document.documentElement.style;

	for (var i = 0; i < props.length; i++) {
		if (props[i] in style) {
			return props[i];
		}
	}
	return false;
}

let TRANSITION = testProp(['transition', 'webkitTransition', 'OTransition', 'MozTransition', 'msTransition'])
let TRANSFORM = testProp(['transformProperty', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform'])

let TRANSLATE_OPEN = 'translate' + (_core_Browser__WEBPACK_IMPORTED_MODULE_0__.webkit3d ? '3d(' : '(')
let TRANSLATE_CLOSE = _core_Browser__WEBPACK_IMPORTED_MODULE_0__.webkit3d ? ',0)' : ')'




/***/ }),

/***/ "./src/js/dom/DOMEvent.js":
/*!********************************!*\
  !*** ./src/js/dom/DOMEvent.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DOMEvent: () => (/* binding */ DOMEvent)
/* harmony export */ });
/* harmony import */ var _ui_Draggable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ui/Draggable */ "./src/js/ui/Draggable.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Browser */ "./src/js/core/Browser.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/*	DOMEvent
	Inspired by Leaflet 
	DomEvent contains functions for working with DOM events.
================================================== */




var DOMEvent = {
	/* inpired by John Resig, Dean Edwards and YUI addEvent implementations */
	addListener: function (/*HTMLElement*/ obj, /*String*/ type, /*Function*/ fn, /*Object*/ context) {
		var id = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.stamp)(fn),
            key = "_tl_" + type + id;

		if (obj[key]) {
			return;
		}

		var handler = function (e) {
			return fn.call(context || obj, e || DOMEvent._getEvent());
		};

		if (_core_Browser__WEBPACK_IMPORTED_MODULE_1__.touch && type === "dblclick" && this.addDoubleTapListener) {
            this.addDoubleTapListener(obj, handler, id);
        } else if ("addEventListener" in obj) {
            if (type === "mousewheel") {
                obj.addEventListener("DOMMouseScroll", handler, false);
                obj.addEventListener(type, handler, false);
            } else if (type === "mouseenter" || type === "mouseleave") {
                var originalHandler = handler,
                    newType = type === "mouseenter" ? "mouseover" : "mouseout";
                handler = function(e) {
                    if (!DOMEvent._checkMouse(obj, e)) {
                        return;
                    }
                    return originalHandler(e);
                };
                obj.addEventListener(newType, handler, false);
            } else {
                obj.addEventListener(type, handler, false);
            }
        } else if ("attachEvent" in obj) {
            obj.attachEvent("on" + type, handler);
        }

		obj[key] = handler;
	},

	removeListener: function (/*HTMLElement*/ obj, /*String*/ type, /*Function*/ fn) {
		var id = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.stamp)(fn),
            key = "_tl_" + type + id,
            handler = obj[key];

		if (!handler) {
			return;
		}

		if (_core_Browser__WEBPACK_IMPORTED_MODULE_1__.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
			this.removeDoubleTapListener(obj, id);
		} else if ('removeEventListener' in obj) {
			if (type === 'mousewheel') {
				obj.removeEventListener('DOMMouseScroll', handler, false);
				obj.removeEventListener(type, handler, false);
			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
				obj.removeEventListener((type === 'mouseenter' ? 'mouseover' : 'mouseout'), handler, false);
			} else {
				obj.removeEventListener(type, handler, false);
			}
		} else if ('detachEvent' in obj) {
			obj.detachEvent("on" + type, handler);
		}
		obj[key] = null;
	},

	_checkMouse: function (el, e) {
		var related = e.relatedTarget;

		if (!related) {
			return true;
		}

		try {
			while (related && (related !== el)) {
				related = related.parentNode;
			}
		} catch (err) {
			return false;
		}

		return (related !== el);
	},

	/*jshint noarg:false */ // evil magic for IE
	_getEvent: function () {
		var e = window.event;
		if (!e) {
			var caller = arguments.callee.caller;
			while (caller) {
				e = caller['arguments'][0];
				if (e && window.Event === e.constructor) {
					break;
				}
				caller = caller.caller;
			}
		}
		return e;
	},
	/*jshint noarg:false */

	stopPropagation: function (/*Event*/ e) {
		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	},
	
	disableClickPropagation: function (/*HTMLElement*/ el) {
		DOMEvent.addListener(el, _ui_Draggable__WEBPACK_IMPORTED_MODULE_0__.Draggable.START, DOMEvent.stopPropagation);
		DOMEvent.addListener(el, "click", DOMEvent.stopPropagation);
		DOMEvent.addListener(el, "dblclick", DOMEvent.stopPropagation);
	},

	preventDefault: function (/*Event*/ e) {
		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
	},

	stop: function (e) {
		DOMEvent.preventDefault(e);
		DOMEvent.stopPropagation(e);
	},


	getWheelDelta: function (e) {
		var delta = 0;
		if (e.wheelDelta) {
			delta = e.wheelDelta / 120;
		}
		if (e.detail) {
			delta = -e.detail / 3;
		}
		return delta;
	}
};




/***/ }),

/***/ "./src/js/dom/DOMMixins.js":
/*!*********************************!*\
  !*** ./src/js/dom/DOMMixins.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DOMMixins: () => (/* binding */ DOMMixins)
/* harmony export */ });
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");
/* harmony import */ var _animation_Animate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../animation/Animate */ "./src/js/animation/Animate.js");
/*	
	DOM methods used regularly
	Assumes there is a _el.container and animator
================================================== */



class DOMMixins {
    /*	Adding, Hiding, Showing etc
	================================================== */
    show(animate) {
        if (animate) {
            /*
			this.animator = Animate(this._el.container, {
				left: 		-(this._el.container.offsetWidth * n) + "px",
				duration: 	this.options.duration,
				easing: 	this.options.ease
			});
			*/
        } else {
            this._el.container.style.display = "block";
        }
    }

    hide(animate) {
        this._el.container.style.display = "none";
    }

    addTo(container) {
        container.appendChild(this._el.container);
        this.onAdd();
    }

    removeFrom(container) {
        container.removeChild(this._el.container);
        this.onRemove();
    }

    /*	Animate to Position
	================================================== */
    animatePosition(pos, el) {
        var ani = {
            duration: this.options.duration,
            easing: this.options.ease
        };
        for (var name in pos) {
            if (pos.hasOwnProperty(name)) {
                ani[name] = pos[name] + "px";
            }
        }

        if (this.animator) {
            this.animator.stop();
        }
        this.animator = (0,_animation_Animate__WEBPACK_IMPORTED_MODULE_1__.Animate)(el, ani);
    }

    /*	Events
	================================================== */

    onLoaded() {
        this.fire("loaded", this.data);
    }

    onAdd() {
        this.fire("added", this.data);
    }

    onRemove() {
        this.fire("removed", this.data);
    }

    /*	Set the Position
	================================================== */
    setPosition(pos, el) {
        for (var name in pos) {
            if (pos.hasOwnProperty(name)) {
                if (el) {
                    el.style[name] = pos[name] + "px";
                } else {
                    this._el.container.style[name] = pos[name] + "px";
                }
            }
        }
    }

    getPosition() {
        return (0,_dom_DOM__WEBPACK_IMPORTED_MODULE_0__.getPosition)(this._el.container);
    }
}


/***/ }),

/***/ "./src/js/language/I18NMixins.js":
/*!***************************************!*\
  !*** ./src/js/language/I18NMixins.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   I18NMixins: () => (/* binding */ I18NMixins)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _language_Language__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../language/Language */ "./src/js/language/Language.js");
/*  I18NMixins
    assumes that its class has an attribute `language` with a Language instance    
================================================== */


class I18NMixins {
    setLanguage(language) {
        this.language = language;
    }

    getLanguage() {
        if (this.language) {
            if (typeof this.language == 'object') {
                return this.language;
            } else {
                (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)(
                    `I18NMixins.getLanguage: this.language should be object, but is ${typeof this
                        .language}`
                );
            }
        }

        // trace("I18NMixins.getLanguage: Expected a language option");
        return _language_Language__WEBPACK_IMPORTED_MODULE_1__.fallback;
    }

    /**
     * Look up a localized version of a standard message using the Language instance
     * that was previously set with {@link setLanguage}.
     * 
     * @see {@link Language#_}
     * @param {string} msg - a message key 
     * @param {Object} [context] - a dictionary with string keys appropriate to message `k` 
     *      and string values which will be interpolated into the message.
     * @returns {string} - a localized string appropriate to the message key
     */
    _(msg, context) {
        return this.getLanguage()._(msg, context);
    }
}



/***/ }),

/***/ "./src/js/language/Language.js":
/*!*************************************!*\
  !*** ./src/js/language/Language.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Language: () => (/* binding */ Language),
/* harmony export */   fallback: () => (/* binding */ fallback),
/* harmony export */   loadLanguage: () => (/* binding */ loadLanguage)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _net_Net__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../net/Net */ "./src/js/net/Net.js");
/* harmony import */ var _date_TLDate__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../date/TLDate */ "./src/js/date/TLDate.js");
/* harmony import */ var _core_TLError__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/TLError */ "./src/js/core/TLError.js");





const MESSAGE_VARIABLE_PATTERN = new RegExp(/\$\{(.+?)\}/g)
    /**
     * Instantiate a Language object to manage I18N. 
     * WARNING: In general, this should not be called directly, because it doesn't block while
     * the language file is loaded, which can lead to race conditions in some cases. In most
     * cases, language objects other than the fallback should be gotten by calling the 
     * async function loadLanguage defined elsewhere in this file.
     * 
     * @param {String} [language=en] - a language code or a URL to a 
     *     translation file
     * @param {string} [script_path] - if `language` is not a URL, this is used
     *     to construct a fully-qualified URL to load a translation file.
     */
class Language {
    constructor(language, script_path) {
        // borrowed from http://stackoverflow.com/a/14446414/102476
        for (let k in LANGUAGES.en) {
            this[k] = LANGUAGES.en[k];
        }
        // `language` won't be defined when the fallback is constructed
        if (language && typeof(language) == 'string' && language != 'en') {
            var code = language;
            if (!(code in LANGUAGES)) {
                console.log(`Expected language ${code} to be cached. Did you call the constructor directly?`)
                var url = buildLanguageURL(code, script_path);
                (0,_net_Net__WEBPACK_IMPORTED_MODULE_1__.fetchJSON)(url).then((json) => {
                    LANGUAGES[code] = json
                }).catch(resp => {
                    console.log(`Error loading language [${url}] ${resp.statusText} [${resp.status}]`)
                })
            }
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)(this, LANGUAGES[code]);
        }
    }

    /**
     * Reimplement Util.mergeData to handle nested dictionaries
     * @param {object} lang_json 
     */
    mergeData(lang_json) {
        for (k in LANGUAGES.en) {
            if (lang_json[k]) {
                if (typeof(this[k]) == 'object') {
                    (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)(lang_json[k], this[k]);
                } else {
                    this[k] = lang_json[k]; // strings, mostly
                }
            }
        }
    }

    formatBigYear(bigyear, format_name) {
        var the_year = bigyear.year;
        var format_list = this.bigdateformats[format_name] || this.bigdateformats['fallback'];

        if (format_list) {
            for (var i = 0; i < format_list.length; i++) {
                var tuple = format_list[i];
                if (Math.abs(the_year / tuple[0]) > 1) {
                    // will we ever deal with distant future dates?
                    return formatNumber(Math.abs(the_year / tuple[0]), tuple[1])
                }
            };

            return the_year.toString();

        } else {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)("Language file dateformats missing cosmological. Falling back.");
            return formatNumber(the_year, format_name);
        }
    }

    /**
     * Look up a localized version of a standard message. While using `_` for the
     * method name is not exactly idiomatic javascript, it was inspired by Python's
     * {@link https://docs.python.org/3/library/gettext.html|gettext} module, with
     * the intention of reducing clutter in places where, in a non-I18N'd app, you'd 
     * simply have a quoted string.
     * 
     * @param {string} k - a message key 
     * @param {Object} [context] - a dictionary with string keys appropriate to message `k` 
     *      and string values which will be interpolated into the message.
     * @returns {string} - a localized string appropriate to the message key
     */
    _(k, context) {
        let msg = this.messages[k] || Language.fallback.messages[k] || k;
        if (msg.match(MESSAGE_VARIABLE_PATTERN)) {
            if (!context) throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("template_message_without_context")
            for (let match of msg.matchAll(MESSAGE_VARIABLE_PATTERN)) {
                if (!(match[1] in context)) throw new _core_TLError__WEBPACK_IMPORTED_MODULE_3__["default"]("template_message_without_context")
                msg = msg.replace(match[0], context[match[1]])
            }
        }
        return msg
    }

    formatDate(date, format_name) {

        if (date.constructor == Date) {
            return this.formatJSDate(date, format_name);
        }

        if (date.constructor == _date_TLDate__WEBPACK_IMPORTED_MODULE_2__.BigYear) {
            return this.formatBigYear(date, format_name);
        }

        if (date.data && date.data.date_obj) {
            return this.formatDate(date.data.date_obj, format_name);
        }

        (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)("Unfamiliar date presented for formatting");
        return date.toString();
    }



    formatJSDate(js_date, format_name) {
        // ultimately we probably want this to work with TLDate instead of (in addition to?) JS Date
        // utc, timezone and timezoneClip are carry over from Steven Levithan implementation. We probably aren't going to use them.
        var self = this;
        var formatPeriod = function(fmt, value) {
            var formats = self.period_labels[fmt];
            if (formats) {
                var fmt = (value < 12) ? formats[0] : formats[1];
            }
            return "<span class='tl-timeaxis-timesuffix'>" + fmt + "</span>";
        }

        var utc = false,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g;


        if (!format_name) {
            format_name = 'full';
        }

        var mask = this.dateformats[format_name] || Language.fallback.dateformats[format_name];
        if (!mask) {
            mask = format_name; // allow custom format strings
        }


        var _ = utc ? "getUTC" : "get",
            d = js_date[_ + "Date"](),
            D = js_date[_ + "Day"](),
            m = js_date[_ + "Month"](),
            y = js_date[_ + "FullYear"](),
            H = js_date[_ + "Hours"](),
            M = js_date[_ + "Minutes"](),
            s = js_date[_ + "Seconds"](),
            L = js_date[_ + "Milliseconds"](),
            o = utc ? 0 : js_date.getTimezoneOffset(),
            year = "",
            flags = {
                d: d,
                dd: (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.pad)(d),
                ddd: this.date.day_abbr[D],
                dddd: this.date.day[D],
                m: m + 1,
                mm: (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.pad)(m + 1),
                mmm: this.date.month_abbr[m],
                mmmm: this.date.month[m],
                yy: String(y).slice(2),
                yyyy: (y < 0 && this.has_negative_year_modifier()) ? Math.abs(y) : y,
                h: H % 12 || 12,
                hh: (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.pad)(H % 12 || 12),
                H: H,
                HH: (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.pad)(H),
                M: M,
                MM: (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.pad)(M),
                s: s,
                ss: (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.pad)(s),
                l: (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.pad)(L, 3),
                L: (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.pad)(L > 99 ? Math.round(L / 10) : L),
                t: formatPeriod('t', H),
                tt: formatPeriod('tt', H),
                T: formatPeriod('T', H),
                TT: formatPeriod('TT', H),
                Z: utc ? "UTC" : (String(js_date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.pad)(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        var formatted = mask.replace(Language.DATE_FORMAT_TOKENS, function($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });

        return this._applyEra(formatted, y);
    }

    has_negative_year_modifier() {
        return Boolean(this.era_labels.negative_year.prefix || this.era_labels.negative_year.suffix);
    }


    _applyEra(formatted_date, original_year) {
        // trusts that the formatted_date was property created with a non-negative year if there are
        // negative affixes to be applied
        var labels = (original_year < 0) ? this.era_labels.negative_year : this.era_labels.positive_year;
        var result = '';
        if (labels.prefix) { result += '<span>' + labels.prefix + '</span> ' }
        result += formatted_date;
        if (labels.suffix) { result += ' <span>' + labels.suffix + '</span>' }
        return result;
    }


}

/**
 * Provide an async factory method for loading languages that clarifies the need to wait 
 * for the language data to be loaded, so that other code doesn't press ahead before the language
 * is available. 
 * 
 * 
 * @param {String} language_code - a language code or a fully-qualified URL to a language JSON file
 * @param {String} script_path - a URL prefix which can be used to construct a fully-qualified URL to a language file using `language_code`
 * 
 * @returns {Language} - an instance of Language, or null if there's an error loading the translation file
 */
async function loadLanguage(language_code, script_path) {
    var url = buildLanguageURL(language_code, script_path);
    try {
        if (!LANGUAGES[language_code]) {
            let json = await (0,_net_Net__WEBPACK_IMPORTED_MODULE_1__.fetchJSON)(url)
            LANGUAGES[language_code] = json
        }
        return new Language(language_code, script_path)
    } catch (e) {
        console.log(`Error loading language [${url}] ${e.statusText}`)
        return null;
    }

}

function buildLanguageURL(code, script_path) {
    if (/\.json$/.test(code)) {
        var url = code;
    } else {
        var fragment = "/locale/" + code + ".json";
        if (/\/$/.test(script_path)) { fragment = fragment.substr(1); }
        var url = script_path + fragment;
    }
    return url;
}

function formatNumber(val, mask) {
    if (mask.match(/%(\.(\d+))?f/)) {
        var match = mask.match(/%(\.(\d+))?f/);
        var token = match[0];
        if (match[2]) {
            val = val.toFixed(match[2]);
        }
        return mask.replace(token, val);
    }
    // use mask as literal display value.
    return mask;
}




Language.fallback = { messages: {} }; // placeholder to satisfy IE8 early compilation


Language.DATE_FORMAT_TOKENS = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;

var LANGUAGES = {
    /*
	This represents the canonical list of message keys which translation files should handle. The existence of the 'en.json' file should not mislead you.
	It is provided more as a starting point for someone who wants to provide a
    new translation since the form for non-default languages (JSON not JS) is slightly different 
    from what appears below. Also, those files have some message keys grandfathered in from TimelineJS2 
    which we'd rather not have to get "re-translated" if we use them.
*/
    en: {
        name: "English (built-in)",
        lang: "en",
        api: {
            wikipedia: "en" // the two letter code at the beginning of the Wikipedia subdomain for this language
        },
        messages: {
            loading: "Loading",
            wikipedia: "From Wikipedia, the free encyclopedia",
            error: "Error",
            return_to_title: "Return to Title",
            go_to_end: "Go to the last slide",
            loading_content: "Loading Content",
            loading_timeline: "Loading Timeline... ",
            swipe_to_navigate: "Swipe to Navigate<br><span class='tl-button'>OK</span>",
            zoom_in: "Zoom in",
            zoom_out: "Zoom out",
            unknown_read_err: "An unexpected error occurred trying to read your spreadsheet data",
            invalid_url_err: "Unable to read Timeline data. Make sure your URL is for a Google Spreadsheet or a Timeline JSON file.",
            network_err: "Unable to read your Google Spreadsheet. Make sure you have published it to the web.",
            missing_start_date_err: "Missing start_date",
            invalid_start_time_without_date: "Invalid configuration: time cannot be used without date.",
            invalid_end_time_without_date: "Invalid configuration: end time cannot be used without end date.",
            date_compare_err: "Can't compare timeline date objects on different scales",
            invalid_scale_err: "Invalid scale",
            invalid_date_err: "Invalid date: month, day and year must be numbers.",
            invalid_separator_error: "Invalid time: misuse of : or . as separator.",
            invalid_hour_err: "Invalid time (hour)",
            invalid_minute_err: "Invalid time (minute)",
            invalid_second_err: "Invalid time (second)",
            invalid_fractional_err: "Invalid time (fractional seconds)",
            invalid_second_fractional_err: "Invalid time (seconds and fractional seconds)",
            invalid_year_err: "Invalid year",
            flickr_notfound_err: "Photo not found or private",
            flickr_invalidurl_err: "Invalid Flickr URL",
            imgur_invalidurl_err: "Invalid Imgur URL",
            twitter_load_err: "Unable to load Tweet",
            twitterembed_invalidurl_err: "Invalid Twitter Embed url",
            wikipedia_load_err: "Unable to load Wikipedia entry",
            wikipedia_image_load_err: "Unable to load Wikipedia image data",
            spotify_invalid_url: "Invalid Spotify URL",
            invalid_rgb_err: "Invalid RGB argument",
            time_scale_scale_err: "Don't know how to get date from time for scale",
            axis_helper_no_options_err: "Axis helper must be configured with options",
            axis_helper_scale_err: "No AxisHelper available for scale",
            invalid_integer_option: "Invalid option value—must be a whole number.",
            instagram_bad_request: "Invalid or private Instagram URL",
            template_message_without_context: "Required variables not provided for template translation message",
            aria_label_timeline: "Timeline",
            aria_label_timeline_navigation: "Timeline navigation",
            aria_label_timeline_content: "Timeline content",
            // The following message keys are pseudo-template literal. 
            // Do not surround with backticks (`) since evaluation is deferred 
            // (and backticks wouldn't be allowed in JSON localization files)
            // for each, document typical values for variable components
            aria_label_zoomin: "Show less than ${start} to ${end}", // 'start' and 'end' should be numeric years 
            aria_label_zoomout: "Show more than ${start} to ${end}" // 'start' and 'end' should be numeric years 
        },
        date: {
            month: [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ],
            month_abbr: [
                "Jan.",
                "Feb.",
                "March",
                "April",
                "May",
                "June",
                "July",
                "Aug.",
                "Sept.",
                "Oct.",
                "Nov.",
                "Dec."
            ],
            day: [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ],
            day_abbr: [
                "Sun.",
                "Mon.",
                "Tues.",
                "Wed.",
                "Thurs.",
                "Fri.",
                "Sat."
            ]
        },
        era_labels: {
            // specify prefix or suffix to apply to formatted date. Blanks mean no change.
            positive_year: {
                prefix: "",
                suffix: ""
            },
            negative_year: {
                // if either of these is specified, the year will be converted to positive before they are applied
                prefix: "",
                suffix: "BCE"
            }
        },
        period_labels: {
            // use of t/tt/T/TT legacy of original Timeline date format
            t: ["a", "p"],
            tt: ["am", "pm"],
            T: ["A", "P"],
            TT: ["AM", "PM"]
        },
        dateformats: {
            year: "yyyy",
            month_short: "mmm",
            month: "mmmm yyyy",
            full_short: "mmm d",
            full: "mmmm d',' yyyy",
            time: "h:MM:ss TT' <small>'mmmm d',' yyyy'</small>'",
            time_short: "h:MM:ss TT",
            time_no_seconds_short: "h:MM TT",
            time_no_minutes_short: "h TT",
            time_no_seconds_small_date: "h:MM TT' <small>'mmmm d',' yyyy'</small>'",
            time_milliseconds: "l",
            full_long: "mmm d',' yyyy 'at' h:MM TT",
            full_long_small_date: "h:MM TT' <small>mmm d',' yyyy'</small>'"
        },
        bigdateformats: {
            fallback: [
                // a list of tuples, with t[0] an order of magnitude and t[1] a format string. format string syntax may change...
                [1000000000, "%.2f billion years ago"],
                [1000000, "%.1f million years ago"],
                [1000, "%.1f thousand years ago"],
                [1, "%f years ago"]
            ],
            compact: [
                [1000000000, "%.2f bya"],
                [1000000, "%.1f mya"],
                [1000, "%.1f kya"],
                [1, "%f years ago"]
            ],
            verbose: [
                [1000000000, "%.2f billion years ago"],
                [1000000, "%.1f million years ago"],
                [1000, "%.1f thousand years ago"],
                [1, "%f years ago"]
            ]
        }
    }
};

let fallback = new Language();
Language.fallback = fallback;


/***/ }),

/***/ "./src/js/media/Media.js":
/*!*******************************!*\
  !*** ./src/js/media/Media.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Media: () => (/* binding */ Media),
/* harmony export */   Text: () => (/* reexport safe */ _types_Text__WEBPACK_IMPORTED_MODULE_5__.Text)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _language_I18NMixins__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../language/I18NMixins */ "./src/js/language/I18NMixins.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Browser */ "./src/js/core/Browser.js");
/* harmony import */ var _types_Text__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./types/Text */ "./src/js/media/types/Text.js");
/* harmony import */ var _ui_Message__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../ui/Message */ "./src/js/ui/Message.js");









class Media {
    constructor(data, options, language) { //add_to_container) {
        if (language) {
            this.setLanguage(language)
        }
        // DOM ELEMENTS
        this._el = {
            container: {},
            content_container: {},
            content: {},
            content_item: {},
            content_link: {},
            caption: null,
            credit: null,
            parent: {},
            link: null
        };

        // Player (If Needed)
        this.player = null;

        // Timer (If Needed)
        this.timer = null;
        this.load_timer = null;

        // Message
        this.message = null;

        // Media ID
        this.media_id = null;

        // State
        this._state = {
            loaded: false,
            show_meta: false,
            media_loaded: false
        };

        // Data
        this.data = {
            unique_id: null,
            url: null,
            credit: null,
            caption: null,
            credit_alternate: null,
            caption_alternate: null,
            link: null,
            link_target: null
        };

        //Options
        this.options = {
            api_key_flickr: "bd3a7c45ddd52f3101825d41563a6125",
            api_key_googlemaps: "AIzaSyB9dW8e_iRrATFa8g24qB6BDBGdkrLDZYI",
            api_key_embedly: "", // ae2da610d1454b66abdf2e6a4c44026d
            credit_height: 0,
            caption_height: 0,
            background: 0 // is background media (for slide)
        };

        this.animator = {};

        // Merge Data and Options
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)(this.options, options);
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)(this.data, data);

        // Don't create DOM elements if this is background media
        if (!this.options.background) {
            this._el.container = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-media");

            if (this.data.unique_id) {
                this._el.container.id = this.data.unique_id;
            }

            this._initLayout();

        }
    }

    loadMedia() {
        var self = this;

        if (!this._state.loaded) {
            try {
                this.load_timer = setTimeout(function() {
                    self.loadingMessage();
                    self._loadMedia();
                    // self._state.loaded = true; handled in onLoaded()
                    self._updateDisplay();
                }, 1200);
            } catch (e) {
                (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)("Error loading media for ", this._media);
                (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)(e);
            }
        }
    }

    _updateMessage(msg) {
        if (this.message) {
            this.message.updateMessage(msg);
        }
    }

    loadingMessage() {
        this._updateMessage(this._('loading') + " " + this.options.media_name);
    }

    errorMessage(msg) {
        if (msg) {
            msg = this._('error') + ": " + msg;
        } else {
            msg = this._('error');
        }
        this._updateMessage(msg);
    }

    updateMediaDisplay(layout) {
        if (this._state.loaded && !this.options.background) {

            if (_core_Browser__WEBPACK_IMPORTED_MODULE_4__.mobile) {
                this._el.content_item.style.maxHeight = (this.options.height / 2) + "px";
            } else {
                this._el.content_item.style.maxHeight = this.options.height - this.options.credit_height - this.options.caption_height - 30 + "px";
            }

            //this._el.content_item.style.maxWidth = this.options.width + "px";
            this._el.container.style.maxWidth = this.options.width + "px";
            // Fix for max-width issues in Firefox
            if (_core_Browser__WEBPACK_IMPORTED_MODULE_4__.firefox) {
                if (this._el.content_item.offsetWidth > this._el.content_item.offsetHeight) {
                    //this._el.content_item.style.width = "100%";
                }
            }

            this._updateMediaDisplay(layout);

            if (this._state.media_loaded) {
                if (this._el.credit) {
                    this._el.credit.style.width = this._el.content_item.offsetWidth + "px";
                }
                if (this._el.caption) {
                    this._el.caption.style.width = this._el.content_item.offsetWidth + "px";
                }
            }

        }
    }

    /*	Media Specific
    ================================================== */
    _loadMedia() {
        // All overrides must call this.onLoaded() to set state
        this.onLoaded();
    }

    _updateMediaDisplay(l) {
        //this._el.content_item.style.maxHeight = (this.options.height - this.options.credit_height - this.options.caption_height - 16) + "px";
        if (_core_Browser__WEBPACK_IMPORTED_MODULE_4__.firefox) {
            this._el.content_item.style.maxWidth = this.options.width + "px";
            this._el.content_item.style.width = "auto";
        }
    }

    _getMeta() {

    }

    _getImageURL(w, h) {
        // Image-based media types should return <img>-compatible src url
        return "";
    }

    /*	Public
    ================================================== */
    show() {

    }

    hide() {

    }

    addTo(container) {
        container.appendChild(this._el.container);
        this.onAdd();
    }

    removeFrom(container) {
        container.removeChild(this._el.container);
        this.onRemove();
    }

    getImageURL(w, h) {
        return this._getImageURL(w, h);
    }

    // Update Display
    updateDisplay(w, h, l) {
        this._updateDisplay(w, h, l);
    }

    stopMedia() {
        try {
            this._stopMedia();
        } catch (e) {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)(`stopMedia() exception: ${e}`)
        }
    }

    loadErrorDisplay(message) {
        try {
            this._el.content.removeChild(this._el.content_item);
        } catch (e) {
            // if this._el.content_item isn't a child of this._el then just keep truckin
        }
        this._el.content_item = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-media-item tl-media-loaderror", this._el.content);
        this._el.content_item.innerHTML = "<div class='tl-icon-" + this.options.media_type + "'></div><p>" + message + "</p>";

        // After Loaded
        this.onLoaded(true);
    }

    /*	Events
    ================================================== */
    onLoaded(error) {
        this._state.loaded = true;
        this.fire("loaded", this.data);
        if (this.message) {
            this.message.hide();
        }
        if (!(error || this.options.background)) {
            this.showMeta();
        }
        this.updateDisplay();
    }

    onMediaLoaded(e) {
        this._state.media_loaded = true;
        this.fire("media_loaded", this.data);
        if (this._el.credit) {
            this._el.credit.style.width = this._el.content_item.offsetWidth + "px";
        }
        if (this._el.caption) {
            this._el.caption.style.width = this._el.content_item.offsetWidth + "px";
        }
    }

    showMeta(credit, caption) {
        this._state.show_meta = true;
        // Credit
        if (this.data.credit && this.data.credit != "") {
            this._el.credit = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-credit", this._el.content_container);
            this._el.credit.innerHTML = this.options.autolink == true ? (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.linkify)(this.data.credit) : this.data.credit;
            this.options.credit_height = this._el.credit.offsetHeight;
        }

        // Caption
        if (this.data.caption && this.data.caption != "") {
            this._el.caption = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-caption", this._el.content_container);
            this._el.caption.innerHTML = this.options.autolink == true ? (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.linkify)(this.data.caption) : this.data.caption;
            this.options.caption_height = this._el.caption.offsetHeight;
        }

        if (!this.data.caption || !this.data.credit) {
            this.getMeta();
        }

    }

    getMeta() {
        this._getMeta();
    }

    updateMeta() {
        if (!this.data.credit && this.data.credit_alternate) {
            this._el.credit = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-credit", this._el.content_container);
            this._el.credit.innerHTML = this.data.credit_alternate;
            this.options.credit_height = this._el.credit.offsetHeight;
        }

        if (!this.data.caption && this.data.caption_alternate) {
            this._el.caption = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-caption", this._el.content_container);
            this._el.caption.innerHTML = this.data.caption_alternate;
            this.options.caption_height = this._el.caption.offsetHeight;
        }

        this.updateDisplay();
    }

    onAdd() {
        this.fire("added", this.data);
    }

    onRemove() {
        this.fire("removed", this.data);
    }

    /*	Private Methods
    ================================================== */
    _initLayout() {

        // Message
        this.message = new _ui_Message__WEBPACK_IMPORTED_MODULE_6__["default"](this._el.container, this.options, this.getLanguage());
        // this.message.addTo(this._el.container);

        // Create Layout
        this._el.content_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-media-content-container", this._el.container);

        // Link
        if (this.data.link && this.data.link != "") {

            this._el.link = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("a", "tl-media-link", this._el.content_container);
            this._el.link.href = this.data.link;
            if (this.data.link_target && this.data.link_target != "") {
                this._el.link.target = this.data.link_target;
            } else {
                this._el.link.target = "_blank";
            }

            if (this._el.link.target == '_blank') {
                this._el.link.setAttribute('rel', 'noopener');
            }

            this._el.content = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-media-content", this._el.link);

        } else {
            this._el.content = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-media-content", this._el.content_container);
        }


    }

    // Update Display
    _updateDisplay(w, h, l) {
        if (w) {
            this.options.width = w;

        }
        //this._el.container.style.width = this.options.width + "px";
        if (h) {
            this.options.height = h;
        }

        if (l) {
            this.options.layout = l;
        }

        if (this._el.credit) {
            this.options.credit_height = this._el.credit.offsetHeight;
        }
        if (this._el.caption) {
            this.options.caption_height = this._el.caption.offsetHeight + 5;
        }

        this.updateMediaDisplay(this.options.layout);

    }

    domCreate(...params) {
        return _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create(...params)
    }

    _stopMedia() {

    }

}

(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.classMixin)(Media, _core_Events__WEBPACK_IMPORTED_MODULE_2__["default"], _language_I18NMixins__WEBPACK_IMPORTED_MODULE_1__.I18NMixins)



/***/ }),

/***/ "./src/js/media/MediaType.js":
/*!***********************************!*\
  !*** ./src/js/media/MediaType.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   lookupMediaType: () => (/* binding */ lookupMediaType)
/* harmony export */ });
/* harmony import */ var _types_Image__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types/Image */ "./src/js/media/types/Image.js");
/* harmony import */ var _types_YouTube__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./types/YouTube */ "./src/js/media/types/YouTube.js");
/* harmony import */ var _types_GoogleMap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./types/GoogleMap */ "./src/js/media/types/GoogleMap.js");
/* harmony import */ var _types_Blockquote__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./types/Blockquote */ "./src/js/media/types/Blockquote.js");
/* harmony import */ var _types_Wikipedia__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./types/Wikipedia */ "./src/js/media/types/Wikipedia.js");
/* harmony import */ var _types_WikipediaImage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./types/WikipediaImage */ "./src/js/media/types/WikipediaImage.js");
/* harmony import */ var _types_SoundCloud__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./types/SoundCloud */ "./src/js/media/types/SoundCloud.js");
/* harmony import */ var _types_Vimeo__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./types/Vimeo */ "./src/js/media/types/Vimeo.js");
/* harmony import */ var _types_DailyMotion__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./types/DailyMotion */ "./src/js/media/types/DailyMotion.js");
/* harmony import */ var _types_Vine__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./types/Vine */ "./src/js/media/types/Vine.js");
/* harmony import */ var _types_Twitter__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./types/Twitter */ "./src/js/media/types/Twitter.js");
/* harmony import */ var _types_TwitterEmbed__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./types/TwitterEmbed */ "./src/js/media/types/TwitterEmbed.js");
/* harmony import */ var _types_Flickr__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./types/Flickr */ "./src/js/media/types/Flickr.js");
/* harmony import */ var _types_DocumentCloud__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./types/DocumentCloud */ "./src/js/media/types/DocumentCloud.js");
/* harmony import */ var _types_Instagram__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./types/Instagram */ "./src/js/media/types/Instagram.js");
/* harmony import */ var _types_Profile__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./types/Profile */ "./src/js/media/types/Profile.js");
/* harmony import */ var _types_GoogleDoc__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./types/GoogleDoc */ "./src/js/media/types/GoogleDoc.js");
/* harmony import */ var _types_Spotify__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./types/Spotify */ "./src/js/media/types/Spotify.js");
/* harmony import */ var _types_IFrame__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./types/IFrame */ "./src/js/media/types/IFrame.js");
/* harmony import */ var _types_Imgur__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./types/Imgur */ "./src/js/media/types/Imgur.js");
/* harmony import */ var _types_PDF__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./types/PDF */ "./src/js/media/types/PDF.js");
/* harmony import */ var _types_Audio__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./types/Audio */ "./src/js/media/types/Audio.js");
/* harmony import */ var _types_Video__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./types/Video */ "./src/js/media/types/Video.js");
/* harmony import */ var _types_Wistia__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./types/Wistia */ "./src/js/media/types/Wistia.js");
/*
    Determines the type of media the url string is.
    returns an object with .type and .id
    You can add new media types by adding a regex
    to match and the media class name to use to
    render the media

    The image_only parameter indicates that the
    call only wants an image-based media type
    that can be resolved to an image URL.
================================================== */


























/**
 * Given a JavaScript Object for an event from a TimelineConfig,
 * determine the appropriate subclass of Media which can handle creating and showing an 
 * embed in the "media" section of that event's slide.
 *
 * When the `image_only` argument is true, the input `url_or_text` will only be
 * tested against patterns which are known to return images suitable for use as
 * thumbnails and backgrounds. Media classes returned when image_only is true should 
 * implement the getImageURL() function
 *
 * @param {Object} m
 * @param {Boolean} image_only
 * 
 * @returns {Object} a JS object which represents the match, including a `type`, `name`, 
 *                   `match_str`, and `cls`. These are all string values, except `cls`, which
 *                   is a JavaScript class which can be used to instantiate a media embed
 *                   or thumbnail.
 */

function lookupMediaType(m, image_only) {
    var media = {},
        media_types = [{
                type: "youtube",
                name: "YouTube",
                match_str: "^(https?:)?\/*(www.|m.)?youtube|youtu\.be",
                cls: _types_YouTube__WEBPACK_IMPORTED_MODULE_1__["default"]
            },
            {
                type: "vimeo",
                name: "Vimeo",
                match_str: "^(https?:)?\/*(player.)?vimeo\.com",
                cls: _types_Vimeo__WEBPACK_IMPORTED_MODULE_7__["default"]
            },
            {
                type: "dailymotion",
                name: "DailyMotion",
                match_str: "^(https?:)?\/*(www.)?(dailymotion\.com|dai.ly)",
                cls: _types_DailyMotion__WEBPACK_IMPORTED_MODULE_8__["default"]
            },
            {
                type: "vine",
                name: "Vine",
                match_str: "^(https?:)?\/*(www.)?vine\.co",
                cls: _types_Vine__WEBPACK_IMPORTED_MODULE_9__["default"]
            },
            {
                type: "soundcloud",
                name: "SoundCloud",
                match_str: "^(https?:)?\/*(player.)?soundcloud\.com",
                cls: _types_SoundCloud__WEBPACK_IMPORTED_MODULE_6__["default"]
            },
            {
                type: "twitter",
                name: "Twitter",
                match_str: "^(https?:)?\/*(www.)?(twitter|x)\.com",
                cls: _types_Twitter__WEBPACK_IMPORTED_MODULE_10__["default"]
            },
            {
                type: "twitterembed",
                name: "TwitterEmbed",
                match_str: "<blockquote class=['\"]twitter-tweet['\"]",
                cls: _types_TwitterEmbed__WEBPACK_IMPORTED_MODULE_11__["default"]
            },
            {
                type: "googlemaps",
                name: "Google Map",
                match_str: /google.+?\/maps\/@([-\d.]+),([-\d.]+),((?:[-\d.]+[zmayht],?)*)|google.+?\/maps\/search\/([\w\W]+)\/@([-\d.]+),([-\d.]+),((?:[-\d.]+[zmayht],?)*)|google.+?\/maps\/place\/([\w\W]+)\/@([-\d.]+),([-\d.]+),((?:[-\d.]+[zmayht],?)*)|google.+?\/maps\/dir\/([\w\W]+)\/([\w\W]+)\/@([-\d.]+),([-\d.]+),((?:[-\d.]+[zmayht],?)*)/,
                cls: _types_GoogleMap__WEBPACK_IMPORTED_MODULE_2__["default"]
            },
            {
                type: "flickr",
                name: "Flickr",
                match_str: "^(https?:)?\/*(www.)?flickr.com\/photos",
                cls: _types_Flickr__WEBPACK_IMPORTED_MODULE_12__["default"]
            },
            {
                type: "flickr",
                name: "Flickr",
                match_str: "^(https?:\/\/)?flic.kr\/.*",
                cls: _types_Flickr__WEBPACK_IMPORTED_MODULE_12__["default"]
            },
            {
                type: "instagram",
                name: "Instagram",
                match_str: /^(https?:)?\/*(www.)?(instagr.am|^(https?:)?\/*(www.)?instagram.com)\/p\//,
                cls: _types_Instagram__WEBPACK_IMPORTED_MODULE_14__["default"]
            },
            {
                type: "profile",
                name: "Profile",
                match_str: /^(https?:)?\/*(www.)?instagr.am\/[a-zA-Z0-9]{2,}|^(https?:)?\/*(www.)?instagram.com\/[a-zA-Z0-9]{2,}/,
                cls: _types_Profile__WEBPACK_IMPORTED_MODULE_15__["default"]
            },
            {
                type: "documentcloud",
                name: "Document Cloud",
                match_str: /documentcloud.org\//,
                cls: _types_DocumentCloud__WEBPACK_IMPORTED_MODULE_13__["default"]
            },
            {
                type: "wikipedia-image",
                name: "WikipediaImage",
                match_str: "^https:\/\/.+\.wiki[mp]edia\.org.+#/media/.+\.(jpg|jpeg|png|gif|svg|webp)",
                cls: _types_WikipediaImage__WEBPACK_IMPORTED_MODULE_5__["default"]
            },
            {
                type: "wikipedia-image",
                name: "WikipediaImage",
                match_str: "^https:\/\/commons.wikimedia.org/wiki/File:.+\.(jpg|jpeg|png|gif|svg|webp)",
                cls: _types_WikipediaImage__WEBPACK_IMPORTED_MODULE_5__["default"]
            },
            {
                type: "wikipedia",
                name: "Wikipedia",
                match_str: "^(https?:)?\/.+.wikipedia\.org",
                cls: _types_Wikipedia__WEBPACK_IMPORTED_MODULE_4__["default"]
            },
            {
                type: "image",
                name: "Image",
                match_str: /(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i,
                cls: _types_Image__WEBPACK_IMPORTED_MODULE_0__["default"]
            },
            {
                type: "imgur",
                name: "Imgur",
                match_str: /^.*imgur.com\/.+$|<blockquote class=['\"]imgur-embed-pub['\"]/i,
                cls: _types_Imgur__WEBPACK_IMPORTED_MODULE_19__["default"]
            },
            {
                type: "googledocs",
                name: "Google Doc",
                match_str: "^(https?:)?\/*[^.]*.google.com\/[^\/]*\/d\/[^\/]*\/[^\/]*\?usp=shar.*|^(https?:)?\/*drive.google.com\/open\?id=[^\&]*\&authuser=0|^(https?:)?\/\/*drive.google.com\/open\\?id=[^\&]*|^(https?:)?\/*[^.]*.googledrive.com\/host\/[^\/]*\/",
                cls: _types_GoogleDoc__WEBPACK_IMPORTED_MODULE_16__["default"]
            },
            {
                type: "pdf",
                name: "PDF",
                match_str: /^.*\.pdf(\?.*)?(\#.*)?/,
                cls: _types_PDF__WEBPACK_IMPORTED_MODULE_20__["default"]
            },
            {
                type: "spotify",
                name: "spotify",
                match_str: "spotify",
                cls: _types_Spotify__WEBPACK_IMPORTED_MODULE_17__["default"]
            },
            {
                type: "iframe",
                name: "iFrame",
                match_str: "iframe",
                cls: _types_IFrame__WEBPACK_IMPORTED_MODULE_18__["default"]
            },
            {
                type: "blockquote",
                name: "Quote",
                match_str: "blockquote",
                cls: _types_Blockquote__WEBPACK_IMPORTED_MODULE_3__["default"]
            },
            {
                type: "video",
                name: "Video",
                match_str: /(mp4|webm)(\?.*)?$/i,
                cls: _types_Video__WEBPACK_IMPORTED_MODULE_22__["default"]
            },
            {
                type: "wistia",
                name: "Wistia",
                match_str: /https?:\/\/(.+)?(wistia\.com|wi\.st)\/.*/i,
                cls: _types_Wistia__WEBPACK_IMPORTED_MODULE_23__["default"]
            },
            {
                type: "audio",
                name: "Audio",
                match_str: /(mp3|wav|m4a)(\?.*)?$/i,
                cls: _types_Audio__WEBPACK_IMPORTED_MODULE_21__["default"]
            },
            {
                type: "imageblank",
                name: "Imageblank",
                match_str: "",
                cls: _types_Image__WEBPACK_IMPORTED_MODULE_0__["default"]
            }
        ]

    if (image_only) {
        if (m instanceof Array) {
            return false;
        }
        for (var i = 0; i < media_types.length; i++) {
            switch (media_types[i].type) {
                case "flickr":
                case "image":
                case "instagram":
                    if (m.url.match(media_types[i].match_str)) {
                        media = media_types[i];
                        return media;
                    }
                    break;
                default:
                    break;
            }
        }

    } else {
        for (var i = 0; i < media_types.length; i++) {
            if (m.url.match(media_types[i].match_str)) {
                return media_types[i];
            }
        }
    }
    return false;
}


/***/ }),

/***/ "./src/js/media/types/Audio.js":
/*!*************************************!*\
  !*** ./src/js/media/types/Audio.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Audio)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Browser */ "./src/js/core/Browser.js");





class Audio extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {
    _loadMedia() {
        // Loading Message
        this.loadingMessage();

        // Create media?
        if (!this.options.background) {
            this.createMedia();
        }

        // After loaded
        this.onLoaded();
    }

    createMedia() {
        //Transform URL for Dropbox
        var url = (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.transformMediaURL)(this.data.url),
            self = this;

        var self = this,
            audio_class = "tl-media-item tl-media-audio tl-media-shadow";

        this._el.content_item = this.domCreate("audio", audio_class, this._el.content);

        this._el.content_item.controls = true;
        this._el.source_item = this.domCreate("source", "", this._el.content_item);

        // Media Loaded Event
        this._el.content_item.addEventListener('load', function(e) {
            self.onMediaLoaded();
        });

        this._el.source_item.src = url;
        this._el.source_item.type = this._getType(this.data.url, this.data.mediatype.match_str);
        this._el.content_item.innerHTML += "Your browser doesn't support HTML5 audio with " + this._el.source_item.type;
        this.player_element = this._el.content_item
    }

    _updateMediaDisplay(layout) {
        if (_core_Browser__WEBPACK_IMPORTED_MODULE_2__.firefox) {
            this._el.content_item.style.width = "auto";
        }
    }

    _stopMedia() {
        if (this.player_element) {
            this.player_element.pause()
        }
    }


    _getType(url, reg) {
        var ext = url.match(reg);
        var type = "audio/"
        switch (ext[1]) {
            case "mp3":
                type += "mpeg";
                break;
            case "wav":
                type += "wav";
                break;
            case "m4a":
                type += "mp4";
                break;
            default:
                type = "audio";
                break;
        }
        return type
    }

}

/***/ }),

/***/ "./src/js/media/types/Blockquote.js":
/*!******************************************!*\
  !*** ./src/js/media/types/Blockquote.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Blockquote)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var dompurify__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! dompurify */ "./node_modules/dompurify/dist/purify.es.mjs");



class Blockquote extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {
    constructor(data, options, language) { //add_to_container) {
        super(data, options, language);
        this.blockquote = dompurify__WEBPACK_IMPORTED_MODULE_1__["default"].sanitize(this.data.url)
    }
    _loadMedia() {
        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-blockquote", this._el.content);
        this._el.content_container.className = "tl-media-content-container tl-media-content-container-text";

        // API Call
        this._el.content_item.innerHTML = this.blockquote;

        // After Loaded
        this.onLoaded();
    }

    updateMediaDisplay() {
        // override DOM-oriented updates that don't apply to blockquotes	
    }

}

/***/ }),

/***/ "./src/js/media/types/DailyMotion.js":
/*!*******************************************!*\
  !*** ./src/js/media/types/DailyMotion.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DailyMotion)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");



class DailyMotion extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {
    _loadMedia() {
        var api_url,
            self = this;

        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-iframe tl-media-dailymotion", this._el.content);

        // Get Media ID
        if (this.data.url.indexOf("dai.ly/") != -1) {
            this.media_id = this.data.url.substr(this.data.url.indexOf("dai.ly/") + "dai.ly/".length)
        } else if (this.data.url.match("video")) {
            this.media_id = this.data.url.split("video\/")[1].split(/[?&]/)[0];
        } else {
            this.media_id = this.data.url.split("embed\/")[1].split(/[?&]/)[0];
        }

        // some URLs, at least old ones we have, include an underscore and a readable URL string 
        // which gets dropped in a rewrite, but which doesn't work in the embed URL
        if (this.media_id.indexOf('_') != -1) {
            this.media_id = this.media_id.split('_')[0]
        }

        // API URL
        api_url = "https://www.dailymotion.com/embed/video/" + this.media_id + "?api=postMessage";

        // API Call
        this._el.content_item.innerHTML = "<iframe autostart='false' frameborder='0' width='100%' height='100%' src='" + api_url + "'></iframe>"

        // After Loaded
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        if (this._state.loaded) {
            this._el.content_item.style.height = _core_Util__WEBPACK_IMPORTED_MODULE_1__.ratio.r16_9({ w: this._el.content_item.offsetWidth }) + "px";
        }
    }

    _stopMedia() {
        if (this._state.loaded) {
            this._el.content_item.querySelector("iframe").contentWindow.postMessage('{"command":"pause","parameters":[]}', "*");
        }

    }

}

/***/ }),

/***/ "./src/js/media/types/DocumentCloud.js":
/*!*********************************************!*\
  !*** ./src/js/media/types/DocumentCloud.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DocumentCloud)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _core_Load__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Load */ "./src/js/core/Load.js");




class DocumentCloud extends _Media__WEBPACK_IMPORTED_MODULE_1__.Media {

    _loadMedia() {
        var self = this;

        // Create Dom elements
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-documentcloud tl-media-shadow", this._el.content);
        this._el.content_item.id = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.unique_ID)(7)

        // Check url
        if (this.data.url.match(/\.html$/)) {
            this.data.url = this._transformURL(this.data.url);
        } else if (!(this.data.url.match(/.(json|js)$/))) {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)("DOCUMENT CLOUD IN URL BUT INVALID SUFFIX");
        }

        // Load viewer API
        (0,_core_Load__WEBPACK_IMPORTED_MODULE_2__.loadJS)([
                'https://assets.documentcloud.org/viewer/loader.js',
                'https://assets.documentcloud.org/viewer/viewer.js'
            ],
            function() {
                self.createMedia();
            }
        );
    }

    // Viewer API needs js, not html
    _transformURL(url) {
        return url.replace(/(.*)\.html$/, '$1.js')
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._el.content_item.style.height = this.options.height + "px";
        //this._el.content_item.style.width = this.options.width + "px";
    }

    createMedia() {
        // DocumentCloud API call
        // DV is defined by the JS load in _loadMedia
        DV.load(this.data.url, {
            container: '#' + this._el.content_item.id,
            showSidebar: false
        });
        this.onLoaded();
    }


}

/***/ }),

/***/ "./src/js/media/types/Flickr.js":
/*!**************************************!*\
  !*** ./src/js/media/types/Flickr.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Flickr)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _net_Net__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../net/Net */ "./src/js/net/Net.js");
/* harmony import */ var _core_TLError__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/TLError */ "./src/js/core/TLError.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");






class Flickr extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {

    _loadMedia() {
        var api_url,
            self = this;

        try {
            // Get Media ID
            this.establishMediaID();

            // API URL
            api_url = "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=" + this.options.api_key_flickr + "&photo_id=" + this.media_id + "&format=json&jsoncallback=?";

            // API Call
            (0,_net_Net__WEBPACK_IMPORTED_MODULE_1__.getJSON)(api_url, function(d) {
                if (d.stat == "ok") {
                    self.sizes = d.sizes.size; // store sizes info

                    if (!self.options.background) {
                        self.createMedia();
                    }

                    self.onLoaded();
                } else {
                    self.loadErrorDisplay(self._("flickr_notfound_err"));
                }
            });
        } catch (e) {
            self.loadErrorDisplay(self._(e.message_key));
        }
    }

    establishMediaID() {
        if (this.data.url.match(/flic.kr\/.+/i)) {
            var encoded = this.data.url.split('/').slice(-1)[0];
            this.media_id = _core_Util__WEBPACK_IMPORTED_MODULE_3__.base58.decode(encoded);
        } else {
            var marker = 'flickr.com/photos/';
            var idx = this.data.url.indexOf(marker);
            if (idx == -1) { throw new _core_TLError__WEBPACK_IMPORTED_MODULE_2__["default"]("flickr_invalidurl_err"); }
            var pos = idx + marker.length;
            this.media_id = this.data.url.substr(pos).split("/")[1];
        }
    }

    createMedia() {
        var self = this;

        // Link
        this._el.content_link = this.domCreate("a", "", this._el.content);
        this._el.content_link.href = this.data.url;
        this._el.content_link.target = "_blank";
        this._el.content_link.setAttribute('rel', 'noopener');

        // Photo
        this._el.content_item = this.domCreate("img", "tl-media-item tl-media-image tl-media-flickr tl-media-shadow", this._el.content_link);

        if (this.data.alt) {
            this._el.content_item.alt = this.data.alt;
        } else if (this.data.caption) {
            this._el.content_item.alt = (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.unhtmlify)(this.data.caption);
        }

        if (this.data.title) {
            this._el.content_item.title = this.data.title;
        } else if (this.data.caption) {
            this._el.content_item.title = (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.unhtmlify)(this.data.caption);
        }

        // Media Loaded Event
        this._el.content_item.addEventListener('load', function(e) {
            self.onMediaLoaded();
        });

        // Set Image Source
        this._el.content_item.src = this.getImageURL(this.options.width, this.options.height);
    }

    getImageURL(w, h) {
        var best_size = this.size_label(h),
            source = this.sizes[this.sizes.length - 2].source;

        for (var i = 0; i < this.sizes.length; i++) {
            if (this.sizes[i].label == best_size) {
                source = this.sizes[i].source;
            }
        }

        return source;
    }

    _getMeta() {
        var self = this,
            api_url;

        // API URL
        api_url = "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=" + this.options.api_key_flickr + "&photo_id=" + this.media_id + "&format=json&jsoncallback=?";

        // API Call
        (0,_net_Net__WEBPACK_IMPORTED_MODULE_1__.getJSON)(api_url, function(d) {
            self.data.credit_alternate = "<a href='" + self.data.url + "' target='_blank' rel='noopener'>" + d.photo.owner.realname + "</a>";
            self.data.caption_alternate = d.photo.title._content + " " + d.photo.description._content;
            self.updateMeta();
        });
    }

    size_label(s) {
        var _size = "";

        if (s <= 75) {
            if (s <= 0) {
                _size = "Large";
            } else {
                _size = "Thumbnail";
            }
        } else if (s <= 180) {
            _size = "Small";
        } else if (s <= 240) {
            _size = "Small 320";
        } else if (s <= 375) {
            _size = "Medium";
        } else if (s <= 480) {
            _size = "Medium 640";
        } else if (s <= 600) {
            _size = "Large";
        } else {
            _size = "Large";
        }

        return _size;
    }

}

/***/ }),

/***/ "./src/js/media/types/GoogleDoc.js":
/*!*****************************************!*\
  !*** ./src/js/media/types/GoogleDoc.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ GoogleDoc)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");


class GoogleDoc extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {

    /*	Load the media
    ================================================== */
    _loadMedia() {
        var url,
            self = this;

        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-iframe", this._el.content);

        // Get Media ID
        if (this.data.url.match(/open\?id=([^&]+)/)) {
            var doc_id = this.data.url.match(/open\?id=([^&]+)/)[1];
            url = 'https://drive.google.com/file/d/' + doc_id + '/preview'
        } else if (this.data.url.match(/file\/d\/([^/]*)\/?/)) {
            var doc_id = this.data.url.match(/file\/d\/([^/]*)\/?/)[1];
            url = 'https://drive.google.com/file/d/' + doc_id + '/preview'
        } else {
            url = this.data.url;
        }

        // this URL makes something suitable for an img src but what if it's not an image?
        // api_url = "http://www.googledrive.com/host/" + this.media_id + "/";

        this._el.content_item.innerHTML = "<iframe class='doc' frameborder='0' width='100%' height='100%' src='" + url + "'></iframe>";

        // After Loaded
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._el.content_item.style.height = this.options.height + "px";
    }


}

/***/ }),

/***/ "./src/js/media/types/GoogleMap.js":
/*!*****************************************!*\
  !*** ./src/js/media/types/GoogleMap.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ GoogleMap)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");




class GoogleMap extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {

    /*  Load the media
    ================================================== */
    _loadMedia() {

        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-map tl-media-shadow", this._el.content);

        // Get Media ID
        this.media_id = this.data.url;

        // API Call
        this.mapframe = this.domCreate("iframe", "", this._el.content_item);
        this.mapframe.width = "100%";
        this.mapframe.height = "100%";
        this.mapframe.frameBorder = "0";
        this.mapframe.src = this.makeGoogleMapsEmbedURL(this.media_id, this.options.api_key_googlemaps);


        // After Loaded
        this.onLoaded();
    }

    _updateMediaDisplay() {
        if (this._state.loaded) {
            var dimensions = _core_Util__WEBPACK_IMPORTED_MODULE_1__.ratio.square({ w: this._el.content_item.offsetWidth });
            this._el.content_item.style.height = dimensions.h + "px";
        }
    }

    makeGoogleMapsEmbedURL(url, api_key) {
        // Test with https://docs.google.com/spreadsheets/d/1zCpvtRdftlR5fBPppmy_-SkGIo7RMwoPUiGFZDAXbTc/edit
        var Streetview = false;

        function determineMapMode(url) {
            function parseDisplayMode(display_mode, param_string) {
                // Set the zoom param
                if (display_mode.slice(-1) == "z") {
                    param_string["zoom"] = display_mode;
                    // Set the maptype to something other than "roadmap"
                } else if (display_mode.slice(-1) == "m") {
                    // TODO: make this somehow interpret the correct zoom level
                    // until then fake it by using Google's default zoom level
                    param_string["zoom"] = 14;
                    param_string["maptype"] = "satellite";
                    // Set all the fun streetview params
                } else if (display_mode.slice(-1) == "t") {
                    Streetview = true;
                    // streetview uses "location" instead of "center"
                    // "place" mode doesn't have the center param, so we may need to grab that now
                    if (mapmode == "place") {
                        var center = url.match(regexes["place"])[3] + "," + url.match(regexes["place"])[4];
                    } else {
                        var center = param_string["center"];
                        delete param_string["center"];
                    }
                    // Clear out all the other params -- this is so hacky
                    param_string = {};
                    param_string["location"] = center;
                    streetview_params = display_mode.split(",");
                    for (let param in param_defs["streetview"]) {
                        var i = parseInt(param) + 1;
                        if (param_defs["streetview"][param] == "pitch" && streetview_params[i] == "90t") {
                            // Although 90deg is the horizontal default in the URL, 0 is horizontal default for embed URL. WHY??
                            // https://developers.google.com/maps/documentation/javascript/streetview
                            param_string[param_defs["streetview"][param]] = 0;
                        } else {
                            param_string[param_defs["streetview"][param]] = streetview_params[i].slice(0, -1);
                        }
                    }

                }
                return param_string;
            }

            function determineMapModeURL(mapmode, match) {
                var param_string = {};
                var url_root = match[1],
                    display_mode = match[match.length - 1];
                for (let param in param_defs[mapmode]) {
                    // skip first 2 matches, because they reflect the URL and not params
                    var i = parseInt(param) + 2;
                    if (param_defs[mapmode][param] == "center") {
                        param_string[param_defs[mapmode][param]] = match[i] + "," + match[++i];
                    } else {
                        param_string[param_defs[mapmode][param]] = match[i];
                    }
                }

                param_string = parseDisplayMode(display_mode, param_string);
                param_string["key"] = api_key;
                if (Streetview == true) {
                    mapmode = "streetview";
                } else {}
                return (url_root + "/embed/v1/" + mapmode + (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.getParamString)(param_string));
            }


            let mapmode = "view";
            if (url.match(regexes["place"])) {
                mapmode = "place";
            } else if (url.match(regexes["directions"])) {
                mapmode = "directions";
            } else if (url.match(regexes["search"])) {
                mapmode = "search";
            }
            return determineMapModeURL(mapmode, url.match(regexes[mapmode]));

        }

        // These must be in the order they appear in the original URL
        // "key" param not included since it's not in the URL structure
        // Streetview "location" param not included since it's captured as "center"
        // Place "center" param ...um...
        var param_defs = {
            "view": ["center"],
            "place": ["q", "center"],
            "directions": ["origin", "destination", "center"],
            "search": ["q", "center"],
            "streetview": ["fov", "heading", "pitch"]
        };
        // Set up regex parts to make updating these easier if Google changes them
        var root_url_regex = /(https:\/\/.+google.+?\/maps)/;
        var coords_regex = /@([-\d.]+),([-\d.]+)/;
        var address_regex = /([\w\W]+)/;

        // Data doesn't seem to get used for anything
        var data_regex = /data=[\S]*/;

        // Capture the parameters that determine what map tiles to use
        // In roadmap view, mode URLs include zoom paramater (e.g. "14z")
        // In satellite (or "earth") view, URLs include a distance parameter (e.g. "84511m")
        // In streetview, URLs include paramaters like "3a,75y,49.76h,90t" -- see http://stackoverflow.com/a/22988073
        var display_mode_regex = /,((?:[-\d.]+[zmayht],?)*)/;

        var regexes = {
            view: new RegExp(root_url_regex.source + "/" + coords_regex.source + display_mode_regex.source),
            place: new RegExp(root_url_regex.source + "/place/" + address_regex.source + "/" + coords_regex.source + display_mode_regex.source),
            directions: new RegExp(root_url_regex.source + "/dir/" + address_regex.source + "/" + address_regex.source + "/" + coords_regex.source + display_mode_regex.source),
            search: new RegExp(root_url_regex.source + "/search/" + address_regex.source + "/" + coords_regex.source + display_mode_regex.source)
        };
        return determineMapMode(url);
    }

}

/***/ }),

/***/ "./src/js/media/types/IFrame.js":
/*!**************************************!*\
  !*** ./src/js/media/types/IFrame.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ IFrame)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var dompurify__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! dompurify */ "./node_modules/dompurify/dist/purify.es.mjs");



class IFrame extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {
    constructor(data, options, language) { //add_to_container) {
        super(data, options, language);
        this.iframe = dompurify__WEBPACK_IMPORTED_MODULE_1__["default"].sanitize(this.data.url, {
            ADD_TAGS: ['iframe'],
            ADD_ATTR: ['frameborder'],
        })
    }

    _loadMedia() {
        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-iframe", this._el.content);

        // API Call
        this._el.content_item.innerHTML = this.iframe;

        // After Loaded
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._el.content_item.style.height = this.options.height + "px";
    }

}

/***/ }),

/***/ "./src/js/media/types/Image.js":
/*!*************************************!*\
  !*** ./src/js/media/types/Image.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Image)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Browser */ "./src/js/core/Browser.js");




class Image extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {

    _loadMedia() {
        // Loading Message
        this.loadingMessage();

        // Create media?
        if (!this.options.background) {
            this.createMedia();
        }

        // After loaded
        this.onLoaded();
    }

    createMedia() {
        var self = this,
            image_class = "tl-media-item tl-media-image tl-media-shadow";

        if (this.data.url.match(/.png(\?.*)?$/) || this.data.url.match(/.svg(\?.*)?$/)) {
            image_class = "tl-media-item tl-media-image"
        }

        this._el.content_item = this.domCreate("img", image_class, this._el.content);

        if (this.data.alt) {
            this._el.content_item.alt = this.data.alt;
        } else if (this.data.caption) {
            this._el.content_item.alt = (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.unhtmlify)(this.data.caption);
        }

        if (this.data.title) {
            this._el.content_item.title = this.data.title;
        } else if (this.data.caption) {
            this._el.content_item.title = (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.unhtmlify)(this.data.caption);
        }

        // Media Loaded Event
        this._el.content_item.addEventListener('load', function(e) {
            self.onMediaLoaded();
        });

        this._el.content_item.src = this.getImageURL();
    }

    getImageURL(w, h) {
        return (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.transformMediaURL)(this.data.url);
    }

    _updateMediaDisplay(layout) {
        if (_core_Browser__WEBPACK_IMPORTED_MODULE_2__.firefox) {
            //this._el.content_item.style.maxWidth = (this.options.width/2) - 40 + "px";
            this._el.content_item.style.width = "auto";
        }
    }

}

/***/ }),

/***/ "./src/js/media/types/Imgur.js":
/*!*************************************!*\
  !*** ./src/js/media/types/Imgur.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Imgur)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _core_Load__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Load */ "./src/js/core/Load.js");
/* harmony import */ var _net_Net__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../net/Net */ "./src/js/net/Net.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_TLError__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/TLError */ "./src/js/core/TLError.js");






class Imgur extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {

    _loadMedia() {
        try {
            var self = this;

            if (this.data.url.match("<blockquote class=['\"]imgur-embed-pub['\"]")) {
                var found = this.data.url.match(/(imgur\.com)\/(\w+)/);
                this.media_id = found[2];
                this.data.url = "http://imgur.com/gallery/" + this.media_id;
            } else if (this.data.url) {
                this.media_id = this.data.url.split('/').slice(-1)[0];
            }

            (0,_core_Load__WEBPACK_IMPORTED_MODULE_1__.loadJS)([
                    'https://s.imgur.com/min/embed.js'
                ],
                function() {
                    self.createMedia();
                }
            );

        } catch (e) {
            this.loadErrorDisplay(this._("imgur_invalidurl_err"));
        }
    }

    createMedia() {
        var self = this;
        var api_url = "https://api.imgur.com/oembed.json?url=" + this.data.url;

        // Content div
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-image tl-media-imgur",
            this._el.content);

        // API Call

        (0,_net_Net__WEBPACK_IMPORTED_MODULE_2__.ajax)({
            type: 'GET',
            url: api_url,
            dataType: 'json',
            success: function(data) {
                try {
                    self._el.content_item.innerHTML = data.html;
                    setInterval(function() {
                        if (document.querySelector("blockquote.imgur-embed-pub") == null) {
                            clearInterval();
                        } else {
                            imgurEmbed.createIframe();
                            document.getElementById("imageElement").removeAttribute("style");
                            document.getElementById("image").removeAttribute("style");
                        }
                    }, 2000);
                } catch (e) {
                    (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.trace)("Error processing imgur ajax response", e)
                }
            },
            error: function(xhr, errorType, error) {
                if (errorType == 'parsererror') {
                    self.loadErrorDisplay(self._("imgur_invalidurl_err"));
                } else {
                    self.loadErrorDisplay(self._("unknown_read_err", errorType));
                }
            }
        });
        this.onLoaded();

    }

    _updateMediaDisplay() {
        //this.el.content_item = document.getElementById(this._el.content_item.id);
        this._el.content_item.style.width = this.options.width + "px";
        this._el.content_item.style.height = _core_Util__WEBPACK_IMPORTED_MODULE_3__.ratio.r16_9({ w: this.options.width }) + "px";
    }

}

/***/ }),

/***/ "./src/js/media/types/Instagram.js":
/*!*****************************************!*\
  !*** ./src/js/media/types/Instagram.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Instagram)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _net_Net__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../net/Net */ "./src/js/net/Net.js");
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");




const CLIENT_TOKEN = '830b21071290df4f81a35c56abbea096'
const FB_APP_ID = '704270473831239'
const ACCESS_TOKEN = `${FB_APP_ID}|${CLIENT_TOKEN}`
const API_URL_ROOT = `https://graph.facebook.com/v8.0/instagram_oembed?access_token=${ACCESS_TOKEN}&fields=html,thumbnail_url,author_name&url=`

/**
 * Break out from AJAX call for clarity. Remember to .bind() a this value.
 * @param {XMLHttpResponse} resp 
 */
function successHandler(resp) {

    this.oembed_response = resp;

    // Link
    this._el.content_link = this.domCreate("a", "", this._el.content);
    this._el.content_link.href = this.data.url;
    this._el.content_link.target = "_blank";
    this._el.content_link.setAttribute('rel', 'noopener');

    // Photo
    this._el.content_item = this.domCreate("img", "tl-media-item tl-media-image tl-media-instagram tl-media-shadow", this._el.content_link);

    if (this.data.alt) {
        this._el.content_item.alt = this.data.alt;
    } else if (this.data.caption) {
        this._el.content_item.alt = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.unhtmlify)(this.data.caption);
    }

    if (this.data.title) {
        this._el.content_item.title = this.data.title;
    } else if (this.data.caption) {
        this._el.content_item.title = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.unhtmlify)(this.data.caption);
    }

    // Media Loaded Event
    this._el.content_item.addEventListener('load', function(e) {
        this.onMediaLoaded();
    }.bind(this));

    this._el.content_item.src = resp.thumbnail_url

    // After Loaded
    this.onLoaded();

}

/**
 * Break out from AJAX call for clarity. Remember to .bind() a this value.
 * @param {XMLHttpResponse} resp
 */
function errorHandler(resp) {
    let msg = `${resp.statusText} [${resp.status}]`
    if (resp.status == 400) {
        msg = this._('instagram_bad_request')
    }
    this.loadErrorDisplay(msg)
}

class Instagram extends _Media__WEBPACK_IMPORTED_MODULE_2__.Media {



    _loadMedia() {
        // Get Media ID
        this.media_id = this.data.url.split("\/p\/")[1].split("/")[0];

        if (!this.options.background) {
            this.createMedia();
        }

    }

    createMedia() {
        this.oembed_response = null;
        var self = this;

        let data_url = `${API_URL_ROOT}${this.data.url}`
        try {
            ;(0,_net_Net__WEBPACK_IMPORTED_MODULE_1__.ajax)({ // getJSON doesn't let us set an errorhandler :-(
                url: data_url,
                dataType: 'json',
                success: successHandler,
                error: errorHandler,
                context: this
            })
        } catch (e) {
            console.log(`Instagram: error fetching ${data_url}`)
            console.log(e)
            debugger;
        }


    }

    getImageURL() {
        if (this.oembed_response && this.oembed_response.thumbnail_url) {
            return this.oembed_response.thumbnail_url
        }

        (0,_net_Net__WEBPACK_IMPORTED_MODULE_1__.fetchJSON)(`${API_URL_ROOT}${this.data.url}`).then(json => {
            return json.thumbnail_url
        }).catch(err => {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)(`Instagram getImageURL Error: ${err.status} ${err.statusText}`)
        })
    }

    _getMeta() {
        if (this.oembed_response && this.oembed_response.author_name) {
            this.data.credit_alternate = `Instagram: <a href="https://instagram.com/${this.oembed_response.author_name}" target="_blank">@${this.oembed_response.author_name}</a>`
        }
        // nothing in our data helps us provide an alternative caption...
        // this.data.caption_alternate = d.title;
        this.updateMeta();
    }

    sizes(s) {
        var _size = "";
        if (s <= 150) {
            _size = "t";
        } else if (s <= 306) {
            _size = "m";
        } else {
            _size = "l";
        }

        return _size;
    }

}

/***/ }),

/***/ "./src/js/media/types/PDF.js":
/*!***********************************!*\
  !*** ./src/js/media/types/PDF.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PDF)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Browser */ "./src/js/core/Browser.js");




class PDF extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {

    _loadMedia() {
        var url = (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.transformMediaURL)(this.data.url),
            self = this;

        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-iframe", this._el.content);
        var markup = "";
        // not assigning media_id attribute. Seems like a holdover which is no longer used.
        if (_core_Browser__WEBPACK_IMPORTED_MODULE_2__.ie || _core_Browser__WEBPACK_IMPORTED_MODULE_2__.edge || url.match(/dl.dropboxusercontent.com/)) {
            markup = "<iframe class='doc' frameborder='0' width='100%' height='100%' src='//docs.google.com/viewer?url=" + url + "&amp;embedded=true'></iframe>";
        } else {
            markup = "<iframe class='doc' frameborder='0' width='100%' height='100%' src='" + url + "'></iframe>"
        }
        this._el.content_item.innerHTML = markup
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._el.content_item.style.height = this.options.height + "px";
    }


}

/***/ }),

/***/ "./src/js/media/types/Profile.js":
/*!***************************************!*\
  !*** ./src/js/media/types/Profile.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Profile)
/* harmony export */ });
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Browser */ "./src/js/core/Browser.js");
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");



class Profile extends _Media__WEBPACK_IMPORTED_MODULE_1__.Media {
    _loadMedia() {

        this._el.content_item = this.domCreate("img", "tl-media-item tl-media-image tl-media-profile tl-media-shadow", this._el.content);
        this._el.content_item.src = this.data.url;

        this.onLoaded();
    }

    _updateMediaDisplay(layout) {
        if (_core_Browser__WEBPACK_IMPORTED_MODULE_0__.firefox) {
            this._el.content_item.style.maxWidth = (this.options.width / 2) - 40 + "px";
        }
    }

}

/***/ }),

/***/ "./src/js/media/types/SoundCloud.js":
/*!******************************************!*\
  !*** ./src/js/media/types/SoundCloud.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SoundCloud)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _net_Net__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../net/Net */ "./src/js/net/Net.js");
/* harmony import */ var _core_Load__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Load */ "./src/js/core/Load.js");




class SoundCloud extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {
	_loadMedia() {
		var api_url,
			self = this;

		// Create Dom element
		this._el.content_item = this.domCreate("div", "tl-media-item tl-media-iframe tl-media-soundcloud tl-media-shadow", this._el.content);

		// Get Media ID
		this.media_id = this.data.url;

		// API URL
		api_url = "https://soundcloud.com/oembed?url=" + this.media_id + "&format=js&callback=?"

		// API Call
		;(0,_net_Net__WEBPACK_IMPORTED_MODULE_1__.getJSON)(api_url, function(d) {
			;(0,_core_Load__WEBPACK_IMPORTED_MODULE_2__.loadJS)("https://w.soundcloud.com/player/api.js", function() {//load soundcloud api for pausing.
				self.createMedia(d);
			});
		});

	}

	createMedia(d) {
		this._el.content_item.innerHTML = d.html;

		self.widget = SC.Widget(this._el.content_item.querySelector("iframe"));//create widget for api use
		this.soundCloudCreated = true;


		// After Loaded
		this.onLoaded();
	}

	_stopMedia() {
		if (this.soundCloudCreated)
		{
			self.widget.pause();
		}
	}

}


/***/ }),

/***/ "./src/js/media/types/Spotify.js":
/*!***************************************!*\
  !*** ./src/js/media/types/Spotify.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Spotify)
/* harmony export */ });
/* unused harmony export computeMediaId */
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Browser */ "./src/js/core/Browser.js");




function computeMediaId(url) {

    var media_id = null;

    if (url.match(/^spotify:/)) return url; // trust all Spotify URIs will be embeddable

    url = new URL(url)

    // again, we're kind of trusting here, but especially that the embed service will reject wrong cases.
    let path = url.pathname.replace(/\/$/, '') // strip trailing slash if there is one
    return `spotify${path.replace(/\//g,':')}`
}

class Spotify extends _Media__WEBPACK_IMPORTED_MODULE_1__.Media {
    _loadMedia() {

        var api_url;

        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-iframe tl-media-spotify", this._el.content);


        this.media_id = computeMediaId(this.data.url)

        if (this.media_id) {
            // API URL
            api_url = "https://embed.spotify.com/?uri=" + this.media_id + "&theme=white&view=coverart";

            this.player = this.domCreate("iframe", "tl-media-shadow", this._el.content_item);
            this.player.width = "100%";
            this.player.height = "100%";
            this.player.frameBorder = "0";
            this.player.src = api_url;

            // After Loaded
            this.onLoaded();

        } else {
            this.loadErrorDisplay(this._('spotify_invalid_url'));
        }
    }

    // Update Media Display

    _updateMediaDisplay(l) {
        var _height = this.options.height,
            _player_height = 0,
            _player_width = 0;

        if (_core_Browser__WEBPACK_IMPORTED_MODULE_2__.mobile) {
            _height = (this.options.height / 2);
        } else {
            _height = this.options.height - this.options.credit_height - this.options.caption_height - 30;
        }

        this._el.content_item.style.maxHeight = "none";
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)(_height);
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)(this.options.width)
        if (_height > this.options.width) {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)("height is greater")
            _player_height = this.options.width + 80 + "px";
            _player_width = this.options.width + "px";
        } else {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)("width is greater")
            ;(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)(this.options.width)
            _player_height = _height + "px";
            _player_width = _height - 80 + "px";
        }


        this.player.style.width = _player_width;
        this.player.style.height = _player_height;

        if (this._el.credit) {
            this._el.credit.style.width = _player_width;
        }
        if (this._el.caption) {
            this._el.caption.style.width = _player_width;
        }
    }


    _stopMedia() {
        // Need spotify stop code

    }

}

/***/ }),

/***/ "./src/js/media/types/Text.js":
/*!************************************!*\
  !*** ./src/js/media/types/Text.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Text: () => (/* binding */ Text)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../dom/DOM */ "./src/js/dom/DOM.js");




class Text {
	constructor(data, options, add_to_container) {

		this._el = { // defaults
			container: { },
			content_container: { },
			content: { },
            headline_container: { },
			headline: { },
			date: { }
		}

		this.options = { // defaults
			title: false
		}

		this.data = { // defaults
			unique_id: "",
			headline: "headline",
			text: "text"
		}

		;(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.setData)(this, data); // override defaults

		// Merge Options
		(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)(this.options, options);

		this._el.container = _dom_DOM__WEBPACK_IMPORTED_MODULE_2__.create("div", "tl-text");
		this._el.container.id = this.data.unique_id;

		this._initLayout();

		if (add_to_container) {
			add_to_container.appendChild(this._el.container);
		};

	}

	/*	Adding, Hiding, Showing etc
	================================================== */
	show() {

	}

	hide() {

	}

	addTo(container) {
		container.appendChild(this._el.container);
		//this.onAdd();
	}

	removeFrom(container) {
		container.removeChild(this._el.container);
	}

	headlineHeight() {
		return this._el.headline.offsetHeight + 40;
	}

	addDateText(str) {
		this._el.date.innerHTML = str;
	}

	/*	Events
	================================================== */
	onLoaded() {
		this.fire("loaded", this.data);
	}

	onAdd() {
		this.fire("added", this.data);
	}

	onRemove() {
		this.fire("removed", this.data);
	}

	/*	Private Methods
	================================================== */
	_initLayout() {

		// Create Layout
		this._el.content_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_2__.create("div", "tl-text-content-container", this._el.container);
		this._el.headline_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_2__.create("div", "tl-text-headline-container", this._el.content_container);

        // Headline
        if (this.data.headline != "") {
            var headline_class = "tl-headline";
            if (this.options.title) {
                headline_class = "tl-headline tl-headline-title";
            }
            this._el.headline = _dom_DOM__WEBPACK_IMPORTED_MODULE_2__.create("h2", headline_class, this._el.headline_container);
            this._el.headline.innerHTML		= this.data.headline;
        }

        // Date
		this._el.date = _dom_DOM__WEBPACK_IMPORTED_MODULE_2__.create("h3", "tl-headline-date", this._el.headline_container);

		// Text
		if (this.data.text != "") {
			var text_content = "";
			text_content += (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.htmlify)(this.options.autolink == true ? (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.linkify)(this.data.text) : this.data.text);
			this._el.content				= _dom_DOM__WEBPACK_IMPORTED_MODULE_2__.create("div", "tl-text-content", this._el.content_container);
			this._el.content.innerHTML		= text_content;
		}

		// Fire event that the slide is loaded
		this.onLoaded();

	}

}

(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.classMixin)(Text, _core_Events__WEBPACK_IMPORTED_MODULE_1__["default"])


/***/ }),

/***/ "./src/js/media/types/Twitter.js":
/*!***************************************!*\
  !*** ./src/js/media/types/Twitter.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Twitter)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _net_Net__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../net/Net */ "./src/js/net/Net.js");
/* harmony import */ var _core_Load__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Load */ "./src/js/core/Load.js");




class Twitter extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {
    _loadMedia() {
        var api_url,
            self = this;

        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-twitter", this._el.content);
        this._el.content_container.className = "tl-media-content-container tl-media-content-container-text";

        // Get Media ID
        if (this.data.url.match("^(https?:)?\/*(www.)?(twitter|x)\.com")) {
            if (this.data.url.match("status\/")) {
                this.media_id = this.data.url.split("status\/")[1];
            } else if (this.data.url.match("statuses\/")) {
                this.media_id = this.data.url.split("statuses\/")[1];
            } else {
                this.media_id = "";
            }
        } else if (this.data.url.match("<blockquote class=['\"]twitter-tweet['\"]")) {

            var found = this.data.url.match(/(status|statuses)\/(\d+)/);
            if (found && found.length > 2) {
                this.media_id = found[2];
            } else {
                self.loadErrorDisplay(self._("twitterembed_invalidurl_err"));
                return;
            }
        }

        // API URL
        api_url = "https://api.twitter.com/1/statuses/oembed.json?id=" + this.media_id + "&omit_script=true&include_entities=true&callback=?";

        // API Call
        (0,_net_Net__WEBPACK_IMPORTED_MODULE_1__.ajax)({
            type: 'GET',
            url: api_url,
            dataType: 'json', //json data type
            success: function(d) {
                self.createMedia(d);
            },
            error: function(xhr, type) {
                var error_text = "";
                error_text += self._("twitter_load_err") + "<br/>" + self.media_id + "<br/>" + type;
                self.loadErrorDisplay(error_text);
            }
        });

    }

    createMedia(d) {
        var tweet = "",
            tweet_text = "",
            tweetuser = "",
            tweet_status_temp = "",
            tweet_status_url = "",
            tweet_status_date = "",
            self = this;

        //	TWEET CONTENT
        tweet_text = d.html.split("<\/p>\&mdash;")[0] + "</p></blockquote>";
        tweetuser = d.author_url.split("twitter.com\/")[1];
        tweet_status_temp = d.html.split("<\/p>\&mdash;")[1].split("<a href=\"")[1];
        tweet_status_url = tweet_status_temp.split("\"\>")[0];
        tweet_status_date = tweet_status_temp.split("\"\>")[1].split("<\/a>")[0];

        // Open links in new window
        tweet_text = tweet_text.replace(/<a href/ig, '<a target="_blank" rel="noopener" href');

        if (tweet_text.includes("pic.twitter.com") || tweet_text.includes("pic.x.com")) {
            // platform.x.com gets redirected to platform.twitter.com as of 2024-12-13
            (0,_core_Load__WEBPACK_IMPORTED_MODULE_2__.loadJS)('https://platform.twitter.com/widgets.js', function() {
                twttr.widgets.createTweet(self.media_id, self._el.content_item, {
                    conversation: 'none', // or all
                    linkColor: '#cc0000', // default is blue
                    theme: 'light' // or dark
                })
            });

            this.onLoaded();

        } else {

            // 	TWEET CONTENT
            tweet += tweet_text;

            //	TWEET AUTHOR
            tweet += "<div class='vcard'>";
            tweet += "<a href='" + tweet_status_url + "' class='twitter-date' rel='noopener' target='_blank'>" + tweet_status_date + "</a>";
            tweet += "<img src='" + "' class='tl-media-item tl-media-image'>" + "</a>";
            tweet += "<div class='author'>";
            tweet += "<a class='screen-name url' href='" + d.author_url + "' rel='noopener' target='_blank'>";
            tweet += "<span class='avatar'></span>";
            tweet += "<span class='fn'>" + d.author_name + " <span class='tl-icon-twitter'></span></span>";
            tweet += "<span class='nickname'>@" + tweetuser + "<span class='thumbnail-inline'></span></span>";
            tweet += "</a>";
            tweet += "</div>";
            tweet += "</div>";


            // Add to DOM
            this._el.content_item.innerHTML = tweet;

            // After Loaded
            this.onLoaded();
        }
    }


    updateMediaDisplay() {

    }

    _updateMediaDisplay() {

    }
}


/***/ }),

/***/ "./src/js/media/types/TwitterEmbed.js":
/*!********************************************!*\
  !*** ./src/js/media/types/TwitterEmbed.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TwitterEmbed)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _net_Net__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../net/Net */ "./src/js/net/Net.js");



class TwitterEmbed extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {
    _loadMedia() {
        var api_url,
            self = this;

        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-twitter", this._el.content);
        this._el.content_container.className = "tl-media-content-container tl-media-content-container-text";

        // Get Media ID
        var found = this.data.url.match(/(status|statuses)\/(\d+)/);
        if (found && found.length > 2) {
            this.media_id = found[2];
        } else {
            self.loadErrorDisplay(self._("twitterembed_invalidurl_err"));
            return;
        }

        // API URL
        api_url = "https://api.twitter.com/1/statuses/oembed.json?id=" + this.media_id + "&omit_script=true&include_entities=true&callback=?";

        window.twttr = (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0],
                t = window.twttr || {};
            if (d.getElementById(id)) return t;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);

            t._e = [];
            t.ready = function(f) {
                t._e.push(f);
            };

            return t;
        }(document, "script", "twitter-wjs"));

        // API Call
        (0,_net_Net__WEBPACK_IMPORTED_MODULE_1__.ajax)({
            type: 'GET',
            url: api_url,
            dataType: 'json', //json data type
            success(d) {
                self.createMedia(d);
            },
            error: function(xhr, type) {
                var error_text = "";
                error_text += self._("twitter_load_err") + "<br/>" + self.media_id + "<br/>" + type;
                self.loadErrorDisplay(error_text);
            }
        });

    }

    createMedia(d) {
        var tweet = "",
            tweet_text = "",
            tweetuser = "",
            tweet_status_temp = "",
            tweet_status_url = "",
            tweet_status_date = "";

        //	TWEET CONTENT
        tweet_text = d.html.split("<\/p>\&mdash;")[0] + "</p></blockquote>";
        tweetuser = d.author_url.split("twitter.com\/")[1];
        tweet_status_temp = d.html.split("<\/p>\&mdash;")[1].split("<a href=\"")[1];
        tweet_status_url = tweet_status_temp.split("\"\>")[0];
        tweet_status_date = tweet_status_temp.split("\"\>")[1].split("<\/a>")[0];

        // Open links in new window
        tweet_text = tweet_text.replace(/<a href/ig, '<a target="_blank" rel="noopener" href');
        let mediaID = this.media_id; // make visible in callback.
        if (tweet_text.includes("pic.twitter.com")) {
            twttr.ready(
                function(evt) {
                    tweet = document.getElementsByClassName("tl-media-twitter")[0];
                    var id = String(mediaID);
                    twttr.widgets.createTweet(id, tweet, {
                            conversation: 'none', // or all
                            linkColor: '#cc0000', // default is blue
                            theme: 'light' // or dark
                        })
                        .then(function(evt) {
                            this.onLoaded();
                        });
                }
            );
            this._el.content_item.innerHTML = tweet;
            this.onLoaded();
        } else {
            // 	TWEET CONTENT
            tweet += tweet_text;

            //	TWEET AUTHOR
            tweet += "<div class='vcard'>";
            tweet += "<a href='" + tweet_status_url + "' class='twitter-date' rel='noopener' target='_blank'>" + tweet_status_date + "</a>";
            tweet += "<div class='author'>";
            tweet += "<a class='screen-name url' href='" + d.author_url + "' rel='noopener' target='_blank'>";
            tweet += "<span class='avatar'></span>";
            tweet += "<span class='fn'>" + d.author_name + " <span class='tl-icon-twitter'></span></span>";
            tweet += "<span class='nickname'>@" + tweetuser + "<span class='thumbnail-inline'></span></span>";
            tweet += "</a>";
            tweet += "</div>";
            tweet += "</div>";


            // Add to DOM
            this._el.content_item.innerHTML = tweet;

            // After Loaded
            this.onLoaded();
        }

    }

    updateMediaDisplay() {

    }

    _updateMediaDisplay() {

    }



}

/***/ }),

/***/ "./src/js/media/types/Video.js":
/*!*************************************!*\
  !*** ./src/js/media/types/Video.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Video)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Browser */ "./src/js/core/Browser.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");




class Video extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {
    _loadMedia() {
        // Loading Message
        this.loadingMessage();

        // Create media?
        if (!this.options.background) {
            this.createMedia();
        }

        // After loaded
        this.onLoaded();
    }

    createMedia() {
        //Transform URL for Dropbox
        var url = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.transformMediaURL)(this.data.url),
            self = this;

        var self = this,
            video_class = "tl-media-item tl-media-video tl-media-shadow";

        // Link
        this._el.content_item = this.domCreate("video", video_class, this._el.content);

        this._el.content_item.controls = true;
        this._el.source_item = this.domCreate("source", "", this._el.content_item);

        // Media Loaded Event
        this._el.content_item.addEventListener('load', function(e) {
            self.onMediaLoaded();
        });

        this._el.source_item.src = url;
        this._el.source_item.type = this._getType(this.data.url, this.data.mediatype.match_str);
        this._el.content_item.innerHTML += "Your browser doesn't support HTML5 video with " + this._el.source_item.type;
        this.player_element = this._el.content_item

    }

    _updateMediaDisplay(layout) {
        if (_core_Browser__WEBPACK_IMPORTED_MODULE_1__.firefox) {
            this._el.content_item.style.width = "auto";
        }
    }

    _stopMedia() {
        if (this.player_element) {
            this.player_element.pause()
        }
    }

    _getType(url, reg) {
        var ext = url.match(reg);
        var type = "video/"
        switch (ext[1]) {
            case "mp4":
                type += "mp4";
                break;
            case "webm":
                type += "webm";
                break;
            default:
                type = "video";
                break;
        }
        return type
    }

}

/***/ }),

/***/ "./src/js/media/types/Vimeo.js":
/*!*************************************!*\
  !*** ./src/js/media/types/Vimeo.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Vimeo)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");



class Vimeo extends _Media__WEBPACK_IMPORTED_MODULE_1__.Media {

    _loadMedia() {
        var api_url,
            self = this;

        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-iframe tl-media-vimeo tl-media-shadow", this._el.content);

        // Get Media ID
        this.media_id = this.data.url.split(/video\/|\/\/vimeo\.com\//)[1].split(/[?&]/)[0];
        var start_time = null;

        // Get start time
        if (this.data.url.match(/#t=([^&]+).*/)) {
            start_time = this.data.url.match(/#t=([^&]+).*/)[1];
        }

        // API URL
        api_url = "https://player.vimeo.com/video/" + this.media_id + "?api=1&title=0&amp;byline=0&amp;portrait=0&amp;color=ffffff";
        if (start_time) {
            api_url = api_url += '&amp;#t=' + start_time;
        }

        this.player = this.domCreate("iframe", "", this._el.content_item);

        // Media Loaded Event
        this.player.addEventListener('load', function(e) {
            self.onMediaLoaded();
        });

        this.player.width = "100%";
        this.player.height = "100%";
        this.player.frameBorder = "0";
        this.player.src = api_url;

        this.player.setAttribute('allowfullscreen', '');
        this.player.setAttribute('webkitallowfullscreen', '');
        this.player.setAttribute('mozallowfullscreen', '');

        // After Loaded
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._el.content_item.style.height = _core_Util__WEBPACK_IMPORTED_MODULE_0__.ratio.r16_9({ w: this._el.content_item.offsetWidth }) + "px";
    }

    _stopMedia() {

        try {
            if (this.player && this.player.contentWindow) {
                this.player.contentWindow.postMessage(JSON.stringify({ method: "pause" }), "https://player.vimeo.com");
            }
        } catch (err) {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)(err);
        }
    }
}

/***/ }),

/***/ "./src/js/media/types/Vine.js":
/*!************************************!*\
  !*** ./src/js/media/types/Vine.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Vine)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");



class Vine extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {

    _loadMedia() {
        var api_url,
            self = this;

        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-iframe tl-media-vine tl-media-shadow", this._el.content);

        // Get Media ID
        this.media_id = this.data.url.split("vine.co/v/")[1];

        // API URL
        api_url = "https://vine.co/v/" + this.media_id + "/embed/simple";

        // API Call
        this._el.content_item.innerHTML = "<iframe frameborder='0' width='100%' height='100%' src='" + api_url + "'></iframe><script async src='https://platform.vine.co/static/scripts/embed.js' charset='utf-8'></script>"

        // After Loaded
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        var size = _core_Util__WEBPACK_IMPORTED_MODULE_1__.ratio.square({ w: this._el.content_item.offsetWidth, h: this.options.height });
        this._el.content_item.style.height = size.h + "px";
    }

    _stopMedia() {
        this._el.content_item.querySelector("iframe").contentWindow.postMessage('pause', '*');
    }

}

/***/ }),

/***/ "./src/js/media/types/Wikipedia.js":
/*!*****************************************!*\
  !*** ./src/js/media/types/Wikipedia.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Wikipedia)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _net_Net__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../net/Net */ "./src/js/net/Net.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");




class Wikipedia extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {

    _loadMedia() {
        var api_url,
            api_language,
            self = this;

        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-wikipedia", this._el.content);
        this._el.content_container.className = "tl-media-content-container tl-media-content-container-text";

        // Get Media ID
        this.media_id = this.data.url.split("wiki\/")[1].split("#")[0].replace("_", " ");
        this.media_id = this.media_id.replace(" ", "%20");
        api_language = this.data.url.split("//")[1].split(".wikipedia")[0];

        // API URL
        api_url = "https://" + api_language + ".wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&redirects=&titles=" + this.media_id + "&exintro=1&format=json&callback=?";

        // API Call
        (0,_net_Net__WEBPACK_IMPORTED_MODULE_1__.ajax)({
            type: 'GET',
            url: api_url,
            dataType: 'json', //json data type

            success: function(d) {
                self.createMedia(d);
            },
            error: function(xhr, type) {
                var error_text = "";
                error_text += self._("wikipedia_load_err") + "<br/>" + self.media_id + "<br/>" + type;
                self.loadErrorDisplay(error_text);
            }
        });

    }

    createMedia(d) {
        var wiki = "";

        if (d.query) {
            var content = "",
                wiki = {
                    entry: {},
                    title: "",
                    text: "",
                    extract: "",
                    paragraphs: 1,
                    page_image: "",
                    text_array: []
                };

            wiki.entry = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.getObjectAttributeByIndex)(d.query.pages, 0);
            wiki.extract = wiki.entry.extract;
            wiki.title = wiki.entry.title;
            wiki.page_image = wiki.entry.thumbnail;

            if (wiki.extract.match("<p>")) {
                wiki.text_array = wiki.extract.split("<p>");
            } else {
                wiki.text_array.push(wiki.extract);
            }

            for (var i = 0; i < wiki.text_array.length; i++) {
                if (i + 1 <= wiki.paragraphs && i + 1 < wiki.text_array.length) {
                    wiki.text += "<p>" + wiki.text_array[i + 1];
                }
            }


            content += "<span class='tl-icon-wikipedia'></span>";
            content += "<div class='tl-wikipedia-title'><h4><a href='" + this.data.url + "' target='_blank' rel='noopener'>" + wiki.title + "</a></h4>";
            content += "<span class='tl-wikipedia-source'>" + this._('wikipedia') + "</span></div>";

            if (wiki.page_image) {
                //content 	+= 	"<img class='tl-wikipedia-pageimage' src='" + wiki.page_image.source +"'>";
            }

            content += wiki.text;

            if (wiki.extract.match("REDIRECT")) {

            } else {
                // Add to DOM
                this._el.content_item.innerHTML = content;
                // After Loaded
                this.onLoaded();
            }


        }

    }

    updateMediaDisplay() {

    }

}

/***/ }),

/***/ "./src/js/media/types/WikipediaImage.js":
/*!**********************************************!*\
  !*** ./src/js/media/types/WikipediaImage.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WikipediaImage)
/* harmony export */ });
/* unused harmony exports computeMediaId, processImageInfoAPIJSON */
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _net_Net__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../net/Net */ "./src/js/net/Net.js");
/* harmony import */ var _core_TLError__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/TLError */ "./src/js/core/TLError.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");





function computeMediaId(url) {

    if (url.match(/^.+#\/media\/.+/)) {
        let parts = url.split('#')
        let file_parts = parts[1].split(':') // the prefix is File in English but different on other language WPs
        return `File:${file_parts[1]}`
    }

    if (url.match(/^.*commons.wikimedia.org\/wiki\/File:.+/)) {
        let parts = url.split('/')
        return parts[parts.length - 1]
    }

    return null
}

/**
 * Given a JSON response from a Wikimedia Commons API call, extract the base thumbnail URL 
 * and the page ID, which can be used to get alt text later.
 * We assume that there is only one meaningful result in the object.
 * 
 * @param {Object} j 
 */
function processImageInfoAPIJSON(j) {
    let response = {}
    if (j.query && j.query.pages) {
        let page_ids = Object.keys(j.query.pages)
        response['page_id'] = page_ids[0]
        let data = j.query.pages[response['page_id']]
        response['url'] = data.imageinfo[0].thumburl
        if (data.entityterms && data.entityterms.label) {
            response['label'] = data.entityterms.label[0]
        }
    }
    return response
}

class WikipediaImage extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {

    _loadMedia() {
        var api_url,
            image_width = Math.round(this.options.width) || 1000, // value to WP API must be int
            language_code = this.getLanguage().lang.toLowerCase(),
            self = this;

        try {
            // Get Media ID
            this.establishMediaID();

            // API URL
            api_url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${this.media_id}&prop=imageinfo|entityterms&iiprop=url&&iiurlwidth=${image_width}&format=json&origin=*&wbetlanguage=${language_code}`
                // API Call
            ;(0,_net_Net__WEBPACK_IMPORTED_MODULE_1__.getJSON)(api_url, function(d) {
                let response = processImageInfoAPIJSON(d)
                if (response.url) {
                    self.base_image_url = response.url
                    self.page_id = response.page_id
                    if (!(self.data.alt) && response.label) {
                        self.data.alt = response.label
                    }

                    if (!self.options.background) {
                        self.createMedia();
                    }

                    self.onLoaded();
                } else {
                    self.loadErrorDisplay(self._("wikipedia_image_load_err"));
                }
            });
        } catch (e) {
            self.loadErrorDisplay(self._(e.message_key));
        }
    }

    /**
     * Analyze the URL provided in the data object passed to the constructor to extract
     * the Wikimedia commons "page" name
     */
    establishMediaID() {
        let media_id = computeMediaId(this.data.url)
        if (media_id) {
            this.media_id = media_id
        } else {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_2__["default"](`Invalid Wikipedia Image URL`)
        }
    }

    createMedia() {
        var self = this;

        // Photo
        this._el.content_item = this.domCreate("img", "tl-media-item tl-media-image tl-media-wikipedia-image tl-media-shadow", this._el.content);

        if (this.data.alt) {
            this._el.content_item.alt = this.data.alt;
        } else if (this.page_id) {
            let wikibase_id = `M${this.page_id}`
            let wikibase_url = `https://commons.wikimedia.org/w/api.php?action=wbgetentities&format=json&ids=${wikibase_id}&format=json&origin=*`
            ;(0,_net_Net__WEBPACK_IMPORTED_MODULE_1__.fetchJSON)(wikibase_url).then(j => {
                if (j.entities && j.entities[wikibase_id]) {
                    let labels = j.entities[wikibase_id].labels
                    let language_code = self.getLanguage().lang.toLowerCase()
                    let label = null
                    if (labels[language_code]) {
                        label = labels[language_code]
                    } else if (language_code.length > 2 && labels[language_code.substr(0, 2)]) {
                        label = labels[language_code.substr(0, 2)]
                    } else if (labels['en']) {
                        label = labels['en']
                    }
                    if (label) {
                        console.log(`wikibase_id: ${self.media_id} alt ${label.value}`)
                        self.data.alt = label.value
                        self._el.content_item.alt = self.data.alt
                    } else {
                        console.log(`wikibase_id: ${self.media_id} ain't got no alt`)
                    }
                }
            })
        }

        if (this.data.title) {
            this._el.content_item.title = this.data.title;
        }

        // Media Loaded Event
        this._el.content_item.addEventListener('load', function(e) {
            self.onMediaLoaded();
        });

        // Set Image Source
        this._el.content_item.src = this.getImageURL(this.options.width, this.options.height);
    }

    _getImageURL(w, h) {
        if (w && this.base_image_url) {
            let match = this.base_image_url.match(/(\/[\d\.]+px-)/)
            if (match) {
                w = Math.round(w) // WP image URLS 404 if floats are used so round it.
                return this.base_image_url.replace(match[1], `/${w}px-`) // Wikipedia will autoscale the image for us
            }
        }
        // they don't always have that pattern!
        return this.base_image_url
    }

}

/**
 * 
 * 
 * https://commons.wikimedia.org/w/api.php?action=query&titles=File:Beryl-Quartz-Emerald-Zambia-33mm_0885.jpg&prop=imageinfo&iiprop=url&&iiurlwidth=1000
 * https://commons.wikimedia.org/wiki/File:Beryl-Quartz-Emerald-Zambia-33mm_0885.jpg
 */


/***/ }),

/***/ "./src/js/media/types/Wistia.js":
/*!**************************************!*\
  !*** ./src/js/media/types/Wistia.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Wistia)
/* harmony export */ });
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");



class Wistia extends _Media__WEBPACK_IMPORTED_MODULE_0__.Media {

    _loadMedia() {
        var api_url,
            self = this;

        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-iframe tl-media-wistia tl-media-shadow", this._el.content);

        // Get Media ID
        this.media_id = this.data.url.split(/https?:\/\/(.+)?(wistia\.com|wi\.st)\/medias\/(.*)/)[3];
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.trace)(`Wistia: media_id: ${this.media_id}`)
            // API URL
        api_url = "https://fast.wistia.com/embed/iframe/" + this.media_id + "?version=v1&controlsVisibleOnLoad=true&playerColor=aae3d8";

        this.player = this.domCreate("iframe", "", this._el.content_item);

        // Media Loaded Event
        this.player.addEventListener('load', function(e) {
            self.onMediaLoaded();
        });

        this.player.width = "100%";
        this.player.height = "100%";
        this.player.frameBorder = "0";
        this.player.src = api_url;

        this.player.setAttribute('allowfullscreen', '');
        this.player.setAttribute('webkitallowfullscreen', '');
        this.player.setAttribute('mozallowfullscreen', '');

        // After Loaded
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._el.content_item.style.height = _core_Util__WEBPACK_IMPORTED_MODULE_1__.ratio.r16_9({ w: this._el.content_item.offsetWidth }) + "px";
    }

    _stopMedia() {
        try {
            this.player.contentWindow.postMessage(JSON.stringify({ method: "pause" }), "https://player.vimeo.com");
        } catch (err) {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.trace)(err);
        }
    }
}

/***/ }),

/***/ "./src/js/media/types/YouTube.js":
/*!***************************************!*\
  !*** ./src/js/media/types/YouTube.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ YouTube)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_Load__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Load */ "./src/js/core/Load.js");
/* harmony import */ var _Media__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Media */ "./src/js/media/Media.js");




class YouTube extends _Media__WEBPACK_IMPORTED_MODULE_2__.Media {
    _loadMedia() {
        var self = this,
            url_vars;

        this.youtube_loaded = false;

        // Create Dom element
        this._el.content_item = this.domCreate("div", "tl-media-item tl-media-youtube tl-media-shadow", this._el.content);
        this._el.content_item.id = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.unique_ID)(7)

        // URL Vars
        url_vars = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.getUrlVars)(this.data.url);

        // Get Media ID
        this.media_id = {};

        if (this.data.url.match('v=')) {
            this.media_id.id = url_vars["v"];
        } else if (this.data.url.match('\/embed\/')) {
            this.media_id.id = this.data.url.split("embed\/")[1].split(/[?&]/)[0];
        } else if (this.data.url.match(/v\/|v=|youtu\.be\//)) {
            this.media_id.id = this.data.url.split(/v\/|v=|youtu\.be\//)[1].split(/[?&]/)[0];
        } else {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)("YOUTUBE IN URL BUT NOT A VALID VIDEO");
        }

        // TODO: switch this to use parseYouTubeTime
        // Get start second
        if (this.data.url.match("start=")) {
            this.media_id.start = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.parseYouTubeTime)(this.data.url.split("start=")[1], 10);
        } else if (this.data.url.match("t=")) {
            this.media_id.start = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.parseYouTubeTime)(this.data.url.split("t=")[1], 10);
        }

        //Get end second
        if (this.data.url.match("end=")) {
            this.media_id.end = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.parseYouTubeTime)(this.data.url.split("end=")[1], 10);
        }

        this.media_id.hd = Boolean(typeof(url_vars["hd"]) != 'undefined');


        // API Call
        (0,_core_Load__WEBPACK_IMPORTED_MODULE_1__.loadJS)('https://www.youtube.com/iframe_api', function() {
            self.createMedia();
        });

    }

    // Update Media Display
    _updateMediaDisplay() {
        //this.el.content_item = document.getElementById(this._el.content_item.id);
        this._el.content_item.style.height = _core_Util__WEBPACK_IMPORTED_MODULE_0__.ratio.r16_9({ w: this.options.width }) + "px";
        this._el.content_item.style.width = this.options.width + "px";
    }

    _stopMedia() {
        if (this.youtube_loaded) {
            try {
                if (this.player.getPlayerState() == YT.PlayerState.PLAYING) {
                    this.player.pauseVideo();
                }
            } catch (err) {
                (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)(err);
            }

        }
    }
    createMedia() {
        var self = this;

        clearTimeout(this.timer);

        if (typeof YT != 'undefined' && typeof YT.Player != 'undefined') {
            // Create Player
            this.player = new YT.Player(this._el.content_item.id, {
                playerVars: {
                    enablejsapi: 1,
                    color: 'white',
                    controls: 1,
                    start: this.media_id.start,
                    end: this.media_id.end,
                    fs: 1
                },
                videoId: this.media_id.id,
                events: {
                    onReady: function() {
                        self.onPlayerReady();
                        // After Loaded
                        self.onLoaded();
                    },
                    'onStateChange': self.onStateChange
                }
            });
        } else {
            this.timer = setTimeout(function() {
                self.createMedia();
            }, 1000);
        }
    }

    /*	Events
    ================================================== */
    onPlayerReady(e) {
        this.youtube_loaded = true;
        this._el.content_item = document.getElementById(this._el.content_item.id);
        this.onMediaLoaded();

    }

    onStateChange(e) {
        if (e.data == YT.PlayerState.ENDED) {
            e.target.seekTo(0);
            e.target.pauseVideo();
        }
    }


}

/***/ }),

/***/ "./src/js/net/Net.js":
/*!***************************!*\
  !*** ./src/js/net/Net.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ajax: () => (/* binding */ ajax),
/* harmony export */   fetchJSON: () => (/* binding */ fetchJSON),
/* harmony export */   getJSON: () => (/* binding */ getJSON)
/* harmony export */ });
var Zepto = (function() {
    var undefined, key, $, classList, emptyArray = [],
        slice = emptyArray.slice,
        filter = emptyArray.filter,
        document = window.document,
        elementDisplay = {},
        classCache = {},
        cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 },
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        rootNodeRE = /^(?:body|html)$/i,
        capitalRE = /([A-Z])/g,

        // special attributes that should be get/set via method calls
        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

        adjacencyOperators = ['after', 'prepend', 'before', 'append'],
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr': document.createElement('tbody'),
            'tbody': table,
            'thead': table,
            'tfoot': table,
            'td': tableRow,
            'th': tableRow,
            '*': document.createElement('div')
        },
        readyRE = /complete|loaded|interactive/,
        classSelectorRE = /^\.([\w-]+)$/,
        idSelectorRE = /^#([\w-]*)$/,
        simpleSelectorRE = /^[\w-]*$/,
        class2type = {},
        toString = class2type.toString,
        zepto = {},
        camelize, uniq,
        tempParent = document.createElement('div'),
        propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            'maxlength': 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'usemap': 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        },
        isArray = Array.isArray ||
        function(object) { return object instanceof Array }

    zepto.matches = function(element, selector) {
        if (!selector || !element || element.nodeType !== 1) return false
        var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
            element.oMatchesSelector || element.matchesSelector
        if (matchesSelector) return matchesSelector.call(element, selector)
            // fall back to performing a selector:
        var match, parent = element.parentNode,
            temp = !parent
        if (temp)(parent = tempParent).appendChild(element)
        match = ~zepto.qsa(parent, selector).indexOf(element)
        temp && tempParent.removeChild(element)
        return match
    }

    function type(obj) {
        return obj == null ? String(obj) :
            class2type[toString.call(obj)] || "object"
    }

    function isFunction(value) { return type(value) == "function" }

    function isWindow(obj) { return obj != null && obj == obj.window }

    function isDocument(obj) { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }

    function isObject(obj) { return type(obj) == "object" }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }

    function likeArray(obj) { return typeof obj.length == 'number' }

    function compact(array) { return filter.call(array, function(item) { return item != null }) }

    function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
    camelize = function(str) { return str.replace(/-+(.)?/g, function(match, chr) { return chr ? chr.toUpperCase() : '' }) }

    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase()
    }
    uniq = function(array) { return filter.call(array, function(item, idx) { return array.indexOf(item) == idx }) }

    function classRE(name) {
        return name in classCache ?
            classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
    }

    function maybeAddPx(name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
    }

    function defaultDisplay(nodeName) {
        var element, display
        if (!elementDisplay[nodeName]) {
            element = document.createElement(nodeName)
            document.body.appendChild(element)
            display = getComputedStyle(element, '').getPropertyValue("display")
            element.parentNode.removeChild(element)
            display == "none" && (display = "block")
            elementDisplay[nodeName] = display
        }
        return elementDisplay[nodeName]
    }

    function children(element) {
        return 'children' in element ?
            slice.call(element.children) :
            $.map(element.childNodes, function(node) { if (node.nodeType == 1) return node })
    }

    // `$.zepto.fragment` takes a html string and an optional tag name
    // to generate DOM nodes nodes from the given html string.
    // The generated DOM nodes are returned as an array.
    // This function can be overriden in plugins for example to make
    // it compatible with browsers that don't support the DOM fully.
    zepto.fragment = function(html, name, properties) {
        var dom, nodes, container

        // A special case optimization for a single tag
        if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

        if (!dom) {
            if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
            if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
            if (!(name in containers)) name = '*'

            container = containers[name]
            container.innerHTML = '' + html
            dom = $.each(slice.call(container.childNodes), function() {
                container.removeChild(this)
            })
        }

        if (isPlainObject(properties)) {
            nodes = $(dom)
            $.each(properties, function(key, value) {
                if (methodAttributes.indexOf(key) > -1) nodes[key](value)
                else nodes.attr(key, value)
            })
        }

        return dom
    }

    // `$.zepto.Z` swaps out the prototype of the given `dom` array
    // of nodes with `$.fn` and thus supplying all the Zepto functions
    // to the array. Note that `__proto__` is not supported on Internet
    // Explorer. This method can be overriden in plugins.
    zepto.Z = function(dom, selector) {
        dom = dom || []
        dom.__proto__ = $.fn
        dom.selector = selector || ''
        return dom
    }

    // `$.zepto.isZ` should return `true` if the given object is a Zepto
    // collection. This method can be overriden in plugins.
    zepto.isZ = function(object) {
        return object instanceof zepto.Z
    }

    // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
    // takes a CSS selector and an optional context (and handles various
    // special cases).
    // This method can be overriden in plugins.
    zepto.init = function(selector, context) {
        var dom
            // If nothing given, return an empty Zepto collection
        if (!selector) return zepto.Z()
            // Optimize for string selectors
        else if (typeof selector == 'string') {
            selector = selector.trim()
                // If it's a html fragment, create nodes from it
                // Note: In both Chrome 21 and Firefox 15, DOM error 12
                // is thrown if the fragment doesn't begin with <
            if (selector[0] == '<' && fragmentRE.test(selector))
                dom = zepto.fragment(selector, RegExp.$1, context), selector = null
                // If there's a context, create a collection on that context first, and select
                // nodes from there
            else if (context !== undefined) return $(context).find(selector)
                // If it's a CSS selector, use it to select nodes.
            else dom = zepto.qsa(document, selector)
        }
        // If a function is given, call it when the DOM is ready
        else if (isFunction(selector)) return $(document).ready(selector)
            // If a Zepto collection is given, just return it
        else if (zepto.isZ(selector)) return selector
        else {
            // normalize array if an array of nodes is given
            if (isArray(selector)) dom = compact(selector)
                // Wrap DOM nodes.
            else if (isObject(selector))
                dom = [selector], selector = null
                // If it's a html fragment, create nodes from it
            else if (fragmentRE.test(selector))
                dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
                // If there's a context, create a collection on that context first, and select
                // nodes from there
            else if (context !== undefined) return $(context).find(selector)
                // And last but no least, if it's a CSS selector, use it to select nodes.
            else dom = zepto.qsa(document, selector)
        }
        // create a new Zepto collection from the nodes found
        return zepto.Z(dom, selector)
    }

    // `$` will be the base `Zepto` object. When calling this
    // function just call `$.zepto.init, which makes the implementation
    // details of selecting nodes and creating Zepto collections
    // patchable in plugins.
    $ = function(selector, context) {
        return zepto.init(selector, context)
    }

    function extend(target, source, deep) {
        for (key in source)
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key]))
                    target[key] = {}
                if (isArray(source[key]) && !isArray(target[key]))
                    target[key] = []
                extend(target[key], source[key], deep)
            } else if (source[key] !== undefined) target[key] = source[key]
    }

    // Copy all but undefined properties from one or more
    // objects to the `target` object.
    $.extend = function(target) {
        var deep, args = slice.call(arguments, 1)
        if (typeof target == 'boolean') {
            deep = target
            target = args.shift()
        }
        args.forEach(function(arg) { extend(target, arg, deep) })
        return target
    }

    // `$.zepto.qsa` is Zepto's CSS selector implementation which
    // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
    // This method can be overriden in plugins.
    zepto.qsa = function(element, selector) {
        var found,
            maybeID = selector[0] == '#',
            maybeClass = !maybeID && selector[0] == '.',
            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
            isSimple = simpleSelectorRE.test(nameOnly)
        return (isDocument(element) && isSimple && maybeID) ?
            ((found = element.getElementById(nameOnly)) ? [found] : []) :
            (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
            slice.call(
                isSimple && !maybeID ?
                maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
                element.getElementsByTagName(selector) : // Or a tag
                element.querySelectorAll(selector) // Or it's not simple, and we need to query all
            )
    }

    function filtered(nodes, selector) {
        return selector == null ? $(nodes) : $(nodes).filter(selector)
    }

    $.contains = function(parent, node) {
        return parent !== node && parent.contains(node)
    }

    function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg
    }

    function setAttribute(node, name, value) {
        value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
    }

    // access className property while respecting SVGAnimatedString
    function className(node, value) {
        var klass = node.className,
            svg = klass && klass.baseVal !== undefined

        if (value === undefined) return svg ? klass.baseVal : klass
        svg ? (klass.baseVal = value) : (node.className = value)
    }

    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    function deserializeValue(value) {
        var num
        try {
            return value ?
                value == "true" ||
                (value == "false" ? false :
                    value == "null" ? null :
                    !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
                    /^[\[\{]/.test(value) ? $.parseJSON(value) :
                    value) :
                value
        } catch (e) {
            return value
        }
    }

    $.type = type
    $.isFunction = isFunction
    $.isWindow = isWindow
    $.isArray = isArray
    $.isPlainObject = isPlainObject

    $.isEmptyObject = function(obj) {
        var name
        for (name in obj) return false
        return true
    }

    $.inArray = function(elem, array, i) {
        return emptyArray.indexOf.call(array, elem, i)
    }

    $.camelCase = camelize
    $.trim = function(str) {
        return str == null ? "" : String.prototype.trim.call(str)
    }

    // plugin compatibility
    $.uuid = 0
    $.support = {}
    $.expr = {}

    $.map = function(elements, callback) {
        var value, values = [],
            i, key
        if (likeArray(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i)
                if (value != null) values.push(value)
            }
        else
            for (key in elements) {
                value = callback(elements[key], key)
                if (value != null) values.push(value)
            }
        return flatten(values)
    }

    $.each = function(elements, callback) {
        var i, key
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) return elements
        } else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) return elements
        }

        return elements
    }

    $.grep = function(elements, callback) {
        return filter.call(elements, callback)
    }

    if (window.JSON) $.parseJSON = JSON.parse

    // Populate the class2type map
    $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase()
    })

    // Define methods that will be available on all
    // Zepto collections
    $.fn = {
        // Because a collection acts like an array
        // copy over these useful array functions.
        forEach: emptyArray.forEach,
        reduce: emptyArray.reduce,
        push: emptyArray.push,
        sort: emptyArray.sort,
        indexOf: emptyArray.indexOf,
        concat: emptyArray.concat,

        // `map` and `slice` in the jQuery API work differently
        // from their array counterparts
        map: function(fn) {
            return $($.map(this, function(el, i) { return fn.call(el, i, el) }))
        },
        slice: function() {
            return $(slice.apply(this, arguments))
        },

        ready: function(callback) {
            // need to check if document.body exists for IE as that browser reports
            // document ready when it hasn't yet created the body element
            if (readyRE.test(document.readyState) && document.body) callback($)
            else document.addEventListener('DOMContentLoaded', function() { callback($) }, false)
            return this
        },
        get: function(idx) {
            return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
        },
        toArray: function() { return this.get() },
        size: function() {
            return this.length
        },
        remove: function() {
            return this.each(function() {
                if (this.parentNode != null)
                    this.parentNode.removeChild(this)
            })
        },
        each: function(callback) {
            emptyArray.every.call(this, function(el, idx) {
                return callback.call(el, idx, el) !== false
            })
            return this
        },
        filter: function(selector) {
            if (isFunction(selector)) return this.not(this.not(selector))
            return $(filter.call(this, function(element) {
                return zepto.matches(element, selector)
            }))
        },
        add: function(selector, context) {
            return $(uniq(this.concat($(selector, context))))
        },
        is: function(selector) {
            return this.length > 0 && zepto.matches(this[0], selector)
        },
        not: function(selector) {
            var nodes = []
            if (isFunction(selector) && selector.call !== undefined)
                this.each(function(idx) {
                    if (!selector.call(this, idx)) nodes.push(this)
                })
            else {
                var excludes = typeof selector == 'string' ? this.filter(selector) :
                    (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
                this.forEach(function(el) {
                    if (excludes.indexOf(el) < 0) nodes.push(el)
                })
            }
            return $(nodes)
        },
        has: function(selector) {
            return this.filter(function() {
                return isObject(selector) ?
                    $.contains(this, selector) :
                    $(this).find(selector).size()
            })
        },
        eq: function(idx) {
            return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
        },
        first: function() {
            var el = this[0]
            return el && !isObject(el) ? el : $(el)
        },
        last: function() {
            var el = this[this.length - 1]
            return el && !isObject(el) ? el : $(el)
        },
        find: function(selector) {
            var result, $this = this
            if (typeof selector == 'object')
                result = $(selector).filter(function() {
                    var node = this
                    return emptyArray.some.call($this, function(parent) {
                        return $.contains(parent, node)
                    })
                })
            else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
            else result = this.map(function() { return zepto.qsa(this, selector) })
            return result
        },
        closest: function(selector, context) {
            var node = this[0],
                collection = false
            if (typeof selector == 'object') collection = $(selector)
            while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
                node = node !== context && !isDocument(node) && node.parentNode
            return $(node)
        },
        parents: function(selector) {
            var ancestors = [],
                nodes = this
            while (nodes.length > 0)
                nodes = $.map(nodes, function(node) {
                    if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node)
                        return node
                    }
                })
            return filtered(ancestors, selector)
        },
        parent: function(selector) {
            return filtered(uniq(this.pluck('parentNode')), selector)
        },
        children: function(selector) {
            return filtered(this.map(function() { return children(this) }), selector)
        },
        contents: function() {
            return this.map(function() { return slice.call(this.childNodes) })
        },
        siblings: function(selector) {
            return filtered(this.map(function(i, el) {
                return filter.call(children(el.parentNode), function(child) { return child !== el })
            }), selector)
        },
        empty: function() {
            return this.each(function() { this.innerHTML = '' })
        },
        // `pluck` is borrowed from Prototype.js
        pluck: function(property) {
            return $.map(this, function(el) { return el[property] })
        },
        show: function() {
            return this.each(function() {
                this.style.display == "none" && (this.style.display = '')
                if (getComputedStyle(this, '').getPropertyValue("display") == "none")
                    this.style.display = defaultDisplay(this.nodeName)
            })
        },
        replaceWith: function(newContent) {
            return this.before(newContent).remove()
        },
        wrap: function(structure) {
            var func = isFunction(structure)
            if (this[0] && !func)
                var dom = $(structure).get(0),
                    clone = dom.parentNode || this.length > 1

            return this.each(function(index) {
                $(this).wrapAll(
                    func ? structure.call(this, index) :
                    clone ? dom.cloneNode(true) : dom
                )
            })
        },
        wrapAll: function(structure) {
            if (this[0]) {
                $(this[0]).before(structure = $(structure))
                var children
                    // drill down to the inmost element
                while ((children = structure.children()).length) structure = children.first()
                $(structure).append(this)
            }
            return this
        },
        wrapInner: function(structure) {
            var func = isFunction(structure)
            return this.each(function(index) {
                var self = $(this),
                    contents = self.contents(),
                    dom = func ? structure.call(this, index) : structure
                contents.length ? contents.wrapAll(dom) : self.append(dom)
            })
        },
        unwrap: function() {
            this.parent().each(function() {
                $(this).replaceWith($(this).children())
            })
            return this
        },
        clone: function() {
            return this.map(function() { return this.cloneNode(true) })
        },
        hide: function() {
            return this.css("display", "none")
        },
        toggle: function(setting) {
            return this.each(function() {
                var el = $(this);
                (setting === undefined ? el.css("display") == "none" : setting) ? el.show(): el.hide()
            })
        },
        prev: function(selector) { return $(this.pluck('previousElementSibling')).filter(selector || '*') },
        next: function(selector) { return $(this.pluck('nextElementSibling')).filter(selector || '*') },
        html: function(html) {
            return arguments.length === 0 ?
                (this.length > 0 ? this[0].innerHTML : null) :
                this.each(function(idx) {
                    var originHtml = this.innerHTML
                    $(this).empty().append(funcArg(this, html, idx, originHtml))
                })
        },
        text: function(text) {
            return arguments.length === 0 ?
                (this.length > 0 ? this[0].textContent : null) :
                this.each(function() { this.textContent = (text === undefined) ? '' : '' + text })
        },
        attr: function(name, value) {
            var result
            return (typeof name == 'string' && value === undefined) ?
                (this.length == 0 || this[0].nodeType !== 1 ? undefined :
                    (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
                    (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
                ) :
                this.each(function(idx) {
                    if (this.nodeType !== 1) return
                    if (isObject(name))
                        for (key in name) setAttribute(this, key, name[key])
                    else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
                })
        },
        removeAttr: function(name) {
            return this.each(function() { this.nodeType === 1 && setAttribute(this, name) })
        },
        prop: function(name, value) {
            name = propMap[name] || name
            return (value === undefined) ?
                (this[0] && this[0][name]) :
                this.each(function(idx) {
                    this[name] = funcArg(this, value, idx, this[name])
                })
        },
        data: function(name, value) {
            var data = this.attr('data-' + name.replace(capitalRE, '-$1').toLowerCase(), value)
            return data !== null ? deserializeValue(data) : undefined
        },
        val: function(value) {
            return arguments.length === 0 ?
                (this[0] && (this[0].multiple ?
                    $(this[0]).find('option').filter(function() { return this.selected }).pluck('value') :
                    this[0].value)) :
                this.each(function(idx) {
                    this.value = funcArg(this, value, idx, this.value)
                })
        },
        offset: function(coordinates) {
            if (coordinates) return this.each(function(index) {
                var $this = $(this),
                    coords = funcArg(this, coordinates, index, $this.offset()),
                    parentOffset = $this.offsetParent().offset(),
                    props = {
                        top: coords.top - parentOffset.top,
                        left: coords.left - parentOffset.left
                    }

                if ($this.css('position') == 'static') props['position'] = 'relative'
                $this.css(props)
            })
            if (this.length == 0) return null
            var obj = this[0].getBoundingClientRect()
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            }
        },
        css: function(property, value) {
            if (arguments.length < 2) {
                var element = this[0],
                    computedStyle = getComputedStyle(element, '')
                if (!element) return
                if (typeof property == 'string')
                    return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
                else if (isArray(property)) {
                    var props = {}
                    $.each(isArray(property) ? property : [property], function(_, prop) {
                        props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
                    })
                    return props
                }
            }

            var css = ''
            if (type(property) == 'string') {
                if (!value && value !== 0)
                    this.each(function() { this.style.removeProperty(dasherize(property)) })
                else
                    css = dasherize(property) + ":" + maybeAddPx(property, value)
            } else {
                for (key in property)
                    if (!property[key] && property[key] !== 0)
                        this.each(function() { this.style.removeProperty(dasherize(key)) })
                    else
                        css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
            }

            return this.each(function() { this.style.cssText += ';' + css })
        },
        index: function(element) {
            return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
        },
        hasClass: function(name) {
            if (!name) return false
            return emptyArray.some.call(this, function(el) {
                return this.test(className(el))
            }, classRE(name))
        },
        addClass: function(name) {
            if (!name) return this
            return this.each(function(idx) {
                classList = []
                var cls = className(this),
                    newName = funcArg(this, name, idx, cls)
                newName.split(/\s+/g).forEach(function(klass) {
                    if (!$(this).hasClass(klass)) classList.push(klass)
                }, this)
                classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
            })
        },
        removeClass: function(name) {
            return this.each(function(idx) {
                if (name === undefined) return className(this, '')
                classList = className(this)
                funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass) {
                    classList = classList.replace(classRE(klass), " ")
                })
                className(this, classList.trim())
            })
        },
        toggleClass: function(name, when) {
            if (!name) return this
            return this.each(function(idx) {
                var $this = $(this),
                    names = funcArg(this, name, idx, className(this))
                names.split(/\s+/g).forEach(function(klass) {
                    (when === undefined ? !$this.hasClass(klass) : when) ?
                    $this.addClass(klass): $this.removeClass(klass)
                })
            })
        },
        scrollTop: function(value) {
            if (!this.length) return
            var hasScrollTop = 'scrollTop' in this[0]
            if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
            return this.each(hasScrollTop ?
                function() { this.scrollTop = value } :
                function() { this.scrollTo(this.scrollX, value) })
        },
        scrollLeft: function(value) {
            if (!this.length) return
            var hasScrollLeft = 'scrollLeft' in this[0]
            if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
            return this.each(hasScrollLeft ?
                function() { this.scrollLeft = value } :
                function() { this.scrollTo(value, this.scrollY) })
        },
        position: function() {
            if (!this.length) return

            var elem = this[0],
                // Get *real* offsetParent
                offsetParent = this.offsetParent(),
                // Get correct offsets
                offset = this.offset(),
                parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top -= parseFloat($(elem).css('margin-top')) || 0
            offset.left -= parseFloat($(elem).css('margin-left')) || 0

            // Add offsetParent borders
            parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0
            parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0

            // Subtract the two offsets
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            }
        },
        offsetParent: function() {
            return this.map(function() {
                var parent = this.offsetParent || document.body
                while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
                    parent = parent.offsetParent
                return parent
            })
        }
    }

    // for now
    $.fn.detach = $.fn.remove

    // Generate the `width` and `height` functions
    ;
    ['width', 'height'].forEach(function(dimension) {
        var dimensionProperty =
            dimension.replace(/./, function(m) { return m[0].toUpperCase() })

        $.fn[dimension] = function(value) {
            var offset, el = this[0]
            if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
                isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
                (offset = this.offset()) && offset[dimension]
            else return this.each(function(idx) {
                el = $(this)
                el.css(dimension, funcArg(this, value, idx, el[dimension]()))
            })
        }
    })

    function traverseNode(node, fun) {
        fun(node)
        for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
    }

    // Generate the `after`, `prepend`, `before`, `append`,
    // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
    adjacencyOperators.forEach(function(operator, operatorIndex) {
        var inside = operatorIndex % 2 //=> prepend, append

        $.fn[operator] = function() {
            // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
            var argType, nodes = $.map(arguments, function(arg) {
                    argType = type(arg)
                    return argType == "object" || argType == "array" || arg == null ?
                        arg : zepto.fragment(arg)
                }),
                parent, copyByClone = this.length > 1
            if (nodes.length < 1) return this

            return this.each(function(_, target) {
                parent = inside ? target : target.parentNode

                // convert all methods to a "before" operation
                target = operatorIndex == 0 ? target.nextSibling :
                    operatorIndex == 1 ? target.firstChild :
                    operatorIndex == 2 ? target :
                    null

                nodes.forEach(function(node) {
                    if (copyByClone) node = node.cloneNode(true)
                    else if (!parent) return $(node).remove()

                    traverseNode(parent.insertBefore(node, target), function(el) {
                        if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                            (!el.type || el.type === 'text/javascript') && !el.src)
                            window['eval'].call(window, el.innerHTML)
                    })
                })
            })
        }

        // after    => insertAfter
        // prepend  => prependTo
        // before   => insertBefore
        // append   => appendTo
        $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function(html) {
            $(html)[operator](this)
            return this
        }
    })

    zepto.Z.prototype = $.fn

    // Export internal API functions in the `$.zepto` namespace
    zepto.uniq = uniq
    zepto.deserializeValue = deserializeValue
    $.zepto = zepto

    return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;
(function($) {
    var $$ = $.zepto.qsa,
        _zid = 1,
        undefined,
        slice = Array.prototype.slice,
        isFunction = $.isFunction,
        isString = function(obj) { return typeof obj == 'string' },
        handlers = {},
        specialEvents = {},
        focusinSupported = 'onfocusin' in window,
        focus = { focus: 'focusin', blur: 'focusout' },
        hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

    function zid(element) {
        return element._zid || (element._zid = _zid++)
    }

    function findHandlers(element, event, fn, selector) {
        event = parse(event)
        if (event.ns) var matcher = matcherFor(event.ns)
        return (handlers[zid(element)] || []).filter(function(handler) {
            return handler &&
                (!event.e || handler.e == event.e) &&
                (!event.ns || matcher.test(handler.ns)) &&
                (!fn || zid(handler.fn) === zid(fn)) &&
                (!selector || handler.sel == selector)
        })
    }

    function parse(event) {
        var parts = ('' + event).split('.')
        return { e: parts[0], ns: parts.slice(1).sort().join(' ') }
    }

    function matcherFor(ns) {
        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
    }

    function eventCapture(handler, captureSetting) {
        return handler.del &&
            (!focusinSupported && (handler.e in focus)) ||
            !!captureSetting
    }

    function realEvent(type) {
        return hover[type] || (focusinSupported && focus[type]) || type
    }

    function add(element, events, fn, data, selector, delegator, capture) {
        var id = zid(element),
            set = (handlers[id] || (handlers[id] = []))
        events.split(/\s/).forEach(function(event) {
            if (event == 'ready') return $(document).ready(fn)
            var handler = parse(event)
            handler.fn = fn
            handler.sel = selector
                // emulate mouseenter, mouseleave
            if (handler.e in hover) fn = function(e) {
                var related = e.relatedTarget
                if (!related || (related !== this && !$.contains(this, related)))
                    return handler.fn.apply(this, arguments)
            }
            handler.del = delegator
            var callback = delegator || fn
            handler.proxy = function(e) {
                e = compatible(e)
                if (e.isImmediatePropagationStopped()) return
                e.data = data
                var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
                if (result === false) e.preventDefault(), e.stopPropagation()
                return result
            }
            handler.i = set.length
            set.push(handler)
            if ('addEventListener' in element)
                element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
        })
    }

    function remove(element, events, fn, selector, capture) {
        var id = zid(element);
        (events || '').split(/\s/).forEach(function(event) {
            findHandlers(element, event, fn, selector).forEach(function(handler) {
                delete handlers[id][handler.i]
                if ('removeEventListener' in element)
                    element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
            })
        })
    }

    $.event = { add: add, remove: remove }

    $.proxy = function(fn, context) {
        if (isFunction(fn)) {
            var proxyFn = function() { return fn.apply(context, arguments) }
            proxyFn._zid = zid(fn)
            return proxyFn
        } else if (isString(context)) {
            return $.proxy(fn[context], fn)
        } else {
            throw new TypeError("expected function")
        }
    }

    $.fn.bind = function(event, data, callback) {
        return this.on(event, data, callback)
    }
    $.fn.unbind = function(event, callback) {
        return this.off(event, callback)
    }
    $.fn.one = function(event, selector, data, callback) {
        return this.on(event, selector, data, callback, 1)
    }

    var returnTrue = function() { return true },
        returnFalse = function() { return false },
        ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
        eventMethods = {
            preventDefault: 'isDefaultPrevented',
            stopImmediatePropagation: 'isImmediatePropagationStopped',
            stopPropagation: 'isPropagationStopped'
        }

    function compatible(event, source) {
        if (source || !event.isDefaultPrevented) {
            source || (source = event)

            $.each(eventMethods, function(name, predicate) {
                var sourceMethod = source[name]
                event[name] = function() {
                    this[predicate] = returnTrue
                    return sourceMethod && sourceMethod.apply(source, arguments)
                }
                event[predicate] = returnFalse
            })

            if (source.defaultPrevented !== undefined ? source.defaultPrevented :
                'returnValue' in source ? source.returnValue === false :
                source.getPreventDefault && source.getPreventDefault())
                event.isDefaultPrevented = returnTrue
        }
        return event
    }

    function createProxy(event) {
        var key, proxy = { originalEvent: event }
        for (key in event)
            if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

        return compatible(proxy, event)
    }

    $.fn.delegate = function(selector, event, callback) {
        return this.on(event, selector, callback)
    }
    $.fn.undelegate = function(selector, event, callback) {
        return this.off(event, selector, callback)
    }

    $.fn.live = function(event, callback) {
        $(document.body).delegate(this.selector, event, callback)
        return this
    }
    $.fn.die = function(event, callback) {
        $(document.body).undelegate(this.selector, event, callback)
        return this
    }

    $.fn.on = function(event, selector, data, callback, one) {
        var autoRemove, delegator, $this = this
        if (event && !isString(event)) {
            $.each(event, function(type, fn) {
                $this.on(type, selector, data, fn, one)
            })
            return $this
        }

        if (!isString(selector) && !isFunction(callback) && callback !== false)
            callback = data, data = selector, selector = undefined
        if (isFunction(data) || data === false)
            callback = data, data = undefined

        if (callback === false) callback = returnFalse

        return $this.each(function(_, element) {
            if (one) autoRemove = function(e) {
                remove(element, e.type, callback)
                return callback.apply(this, arguments)
            }

            if (selector) delegator = function(e) {
                var evt, match = $(e.target).closest(selector, element).get(0)
                if (match && match !== element) {
                    evt = $.extend(createProxy(e), { currentTarget: match, liveFired: element })
                    return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
                }
            }

            add(element, event, callback, data, selector, delegator || autoRemove)
        })
    }
    $.fn.off = function(event, selector, callback) {
        var $this = this
        if (event && !isString(event)) {
            $.each(event, function(type, fn) {
                $this.off(type, selector, fn)
            })
            return $this
        }

        if (!isString(selector) && !isFunction(callback) && callback !== false)
            callback = selector, selector = undefined

        if (callback === false) callback = returnFalse

        return $this.each(function() {
            remove(this, event, callback, selector)
        })
    }

    $.fn.trigger = function(event, args) {
        event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
        event._args = args
        return this.each(function() {
            // items in the collection might not be DOM elements
            if ('dispatchEvent' in this) this.dispatchEvent(event)
            else $(this).triggerHandler(event, args)
        })
    }

    // triggers event handlers on current element just as if an event occurred,
    // doesn't trigger an actual event, doesn't bubble
    $.fn.triggerHandler = function(event, args) {
        var e, result
        this.each(function(i, element) {
            e = createProxy(isString(event) ? $.Event(event) : event)
            e._args = args
            e.target = element
            $.each(findHandlers(element, event.type || event), function(i, handler) {
                result = handler.proxy(e)
                if (e.isImmediatePropagationStopped()) return false
            })
        })
        return result
    }

    // shortcut methods for `.bind(event, fn)` for each event type
    ;
    ('focusin focusout load resize scroll unload click dblclick ' +
        'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
        'change select keydown keypress keyup error').split(' ').forEach(function(event) {
        $.fn[event] = function(callback) {
            return callback ?
                this.bind(event, callback) :
                this.trigger(event)
        }
    })

    ;
    ['focus', 'blur'].forEach(function(name) {
        $.fn[name] = function(callback) {
            if (callback) this.bind(name, callback)
            else this.each(function() {
                try { this[name]() } catch (e) {}
            })
            return this
        }
    })

    $.Event = function(type, props) {
        if (!isString(type)) props = type, type = props.type
        var event = document.createEvent(specialEvents[type] || 'Events'),
            bubbles = true
        if (props)
            for (var name in props)(name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
        event.initEvent(type, bubbles, true)
        return compatible(event)
    }

})(Zepto)

;
(function($) {
    var jsonpID = 0,
        document = window.document,
        key,
        name,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/

    // trigger a custom event and return false if it was cancelled
    function triggerAndReturn(context, eventName, data) {
        var event = $.Event(eventName)
        $(context).trigger(event, data)
        return !event.isDefaultPrevented()
    }

    // trigger an Ajax "global" event
    function triggerGlobal(settings, context, eventName, data) {
        if (settings.global) return triggerAndReturn(context || document, eventName, data)
    }

    // Number of active Ajax requests
    $.active = 0

    function ajaxStart(settings) {
        if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
    }

    function ajaxStop(settings) {
        if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
    }

    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
    function ajaxBeforeSend(xhr, settings) {
        var context = settings.context
        if (settings.beforeSend.call(context, xhr, settings) === false ||
            triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
            return false

        triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
    }

    function ajaxSuccess(data, xhr, settings, deferred) {
        var context = settings.context,
            status = 'success'
        settings.success.call(context, data, status, xhr)
        if (deferred) deferred.resolveWith(context, [data, status, xhr])
        triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
        ajaxComplete(status, xhr, settings)
    }
    // type: "timeout", "error", "abort", "parsererror"
    function ajaxError(error, type, xhr, settings, deferred) {
        var context = settings.context
        settings.error.call(context, xhr, type, error)
        if (deferred) deferred.rejectWith(context, [xhr, type, error])
        triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
        ajaxComplete(type, xhr, settings)
    }
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    function ajaxComplete(status, xhr, settings) {
        var context = settings.context
        settings.complete.call(context, xhr, status)
        triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
        ajaxStop(settings)
    }

    // Empty function, used as default callback
    function empty() {}

    $.ajaxJSONP = function(options, deferred) {
        if (!('type' in options)) return $.ajax(options)

        var _callbackName = options.jsonpCallback,
            callbackName = ($.isFunction(_callbackName) ?
                _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
            script = document.createElement('script'),
            originalCallback = window[callbackName],
            responseData,
            abort = function(errorType) {
                $(script).triggerHandler('error', errorType || 'abort')
            },
            xhr = { abort: abort },
            abortTimeout

        if (deferred) deferred.promise(xhr)

        $(script).on('load error', function(e, errorType) {
            clearTimeout(abortTimeout)
            $(script).off().remove()

            if (e.type == 'error' || !responseData) {
                ajaxError(null, errorType || 'error', xhr, options, deferred)
            } else {
                ajaxSuccess(responseData[0], xhr, options, deferred)
            }

            window[callbackName] = originalCallback
            if (responseData && $.isFunction(originalCallback))
                originalCallback(responseData[0])

            originalCallback = responseData = undefined
        })

        if (ajaxBeforeSend(xhr, options) === false) {
            abort('abort')
            return xhr
        }

        window[callbackName] = function() {
            responseData = arguments
        }

        script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
        document.head.appendChild(script)

        if (options.timeout > 0) abortTimeout = setTimeout(function() {
            abort('timeout')
        }, options.timeout)

        return xhr
    }

    $.ajaxSettings = {
        // Default type of request
        type: 'GET',
        // Callback that is executed before request
        beforeSend: empty,
        // Callback that is executed if the request succeeds
        success: empty,
        // Callback that is executed the the server drops error
        error: empty,
        // Callback that is executed on request complete (both: error and success)
        complete: empty,
        // The context for the callbacks
        context: null,
        // Whether to trigger "global" Ajax events
        global: true,
        // Transport
        xhr: function() {
            return new window.XMLHttpRequest()
        },
        // MIME types mapping
        // IIS returns Javascript as "application/x-javascript"
        accepts: {
            script: 'text/javascript, application/javascript, application/x-javascript',
            json: jsonType,
            xml: 'application/xml, text/xml',
            html: htmlType,
            text: 'text/plain'
        },
        // Whether the request is to another domain
        crossDomain: false,
        // Default timeout
        timeout: 0,
        // Whether data should be serialized to string
        processData: true,
        // Whether the browser should be allowed to cache GET responses
        cache: true
    }

    function mimeToDataType(mime) {
        if (mime) mime = mime.split(';', 2)[0]
        return mime && (mime == htmlType ? 'html' :
            mime == jsonType ? 'json' :
            scriptTypeRE.test(mime) ? 'script' :
            xmlTypeRE.test(mime) && 'xml') || 'text'
    }

    function appendQuery(url, query) {
        if (query == '') return url
        return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }

    // serialize payload and append it to the URL for GET requests
    function serializeData(options) {
        if (options.processData && options.data && $.type(options.data) != "string")
            options.data = $.param(options.data, options.traditional)
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
            options.url = appendQuery(options.url, options.data), options.data = undefined
    }

    $.ajax = function(options) {
        var settings = $.extend({}, options || {}),
            deferred = $.Deferred && $.Deferred()
        for (key in $.ajaxSettings)
            if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

        ajaxStart(settings)

        if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
            RegExp.$2 != window.location.host

        if (!settings.url) settings.url = window.location.toString()
        serializeData(settings)
        if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

        var dataType = settings.dataType,
            hasPlaceholder = /\?.+=\?/.test(settings.url)
        if (dataType == 'jsonp' || hasPlaceholder) {
            if (!hasPlaceholder)
                settings.url = appendQuery(settings.url,
                    settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
            return $.ajaxJSONP(settings, deferred)
        }

        var mime = settings.accepts[dataType],
            headers = {},
            setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = settings.xhr(),
            nativeSetHeader = xhr.setRequestHeader,
            abortTimeout

        if (deferred) deferred.promise(xhr)

        if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
        setHeader('Accept', mime || '*/*')
        if (mime = settings.mimeType || mime) {
            if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
            xhr.overrideMimeType && xhr.overrideMimeType(mime)
        }
        if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
            setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

        if (settings.headers)
            for (name in settings.headers) setHeader(name, settings.headers[name])
        xhr.setRequestHeader = setHeader

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                xhr.onreadystatechange = empty
                clearTimeout(abortTimeout)
                var result, error = false
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
                    result = xhr.responseText

                    try {
                        // http://perfectionkills.com/global-eval-what-are-the-options/
                        if (dataType == 'script')(1, eval)(result)
                        else if (dataType == 'xml') result = xhr.responseXML
                        else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
                    } catch (e) { error = e }

                    if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
                    else ajaxSuccess(result, xhr, settings, deferred)
                } else {
                    ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
                }
            }
        }

        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort()
            ajaxError(null, 'abort', xhr, settings, deferred)
            return xhr
        }

        if (settings.xhrFields)
            for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

        var async = 'async' in settings ? settings.async : true
        xhr.open(settings.type, settings.url, async, settings.username, settings.password)

        for (name in headers) nativeSetHeader.apply(xhr, headers[name])

        if (settings.timeout > 0) abortTimeout = setTimeout(function() {
            xhr.onreadystatechange = empty
            xhr.abort()
            ajaxError(null, 'timeout', xhr, settings, deferred)
        }, settings.timeout)

        // avoid sending empty string (#319)
        xhr.send(settings.data ? settings.data : null)
        return xhr
    }

    // handle optional data/success arguments
    function parseArguments(url, data, success, dataType) {
        var hasData = !$.isFunction(data)
        return {
            url: url,
            data: hasData ? data : undefined,
            success: !hasData ? data : $.isFunction(success) ? success : undefined,
            dataType: hasData ? dataType || success : success
        }
    }

    $.get = function(url, data, success, dataType) {
        return $.ajax(parseArguments.apply(null, arguments))
    }

    $.post = function(url, data, success, dataType) {
        var options = parseArguments.apply(null, arguments)
        options.type = 'POST'
        return $.ajax(options)
    }

    $.getJSON = function(url, data, success) {
        var options = parseArguments.apply(null, arguments)
        options.dataType = 'json'
        return $.ajax(options)
    }

    /**
     * Add a promisified option to better handle cases where we need the data 
     * asynchronously.
     * @param {String} url 
     */
    $.fetchJSON = function(url) {
        var request = new XMLHttpRequest();
        return new Promise(function(resolve, reject) {
            // Setup our listener to process compeleted requests
            request.onreadystatechange = function() {
                try {
                    // Only run if the request is complete
                    if (request.readyState !== 4) return;

                    // Process the response
                    if (request.status >= 200 && request.status < 300) {
                        var json = JSON.parse(request.responseText)
                        resolve(json);
                    } else {
                        reject({
                            status: request.status,
                            statusText: request.statusText
                        });
                    }

                } catch (e) {
                    reject({
                        status: 400,
                        statusText: `Error fetching JSON from ${url}: ${e}`
                    });

                }
            };

            // Setup our HTTP request
            request.open('GET', url, true);

            // Send the request
            request.send();
        })
    }


    $.fn.load = function(url, data, success) {
        if (!this.length) return this
        var self = this,
            parts = url.split(/\s/),
            selector,
            options = parseArguments(url, data, success),
            callback = options.success
        if (parts.length > 1) options.url = parts[0], selector = parts[1]
        options.success = function(response) {
            self.html(selector ?
                $('<div>').html(response.replace(rscript, "")).find(selector) :
                response)
            callback && callback.apply(self, arguments)
        }
        $.ajax(options)
        return this
    }

    var escape = encodeURIComponent

    function serialize(params, obj, traditional, scope) {
        var type, array = $.isArray(obj),
            hash = $.isPlainObject(obj)
        $.each(obj, function(key, value) {
            type = $.type(value)
            if (scope) key = traditional ? scope :
                scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
                // handle data in serializeArray() format
            if (!scope && array) params.add(value.name, value.value)
                // recurse into nested objects
            else if (type == "array" || (!traditional && type == "object"))
                serialize(params, value, traditional, key)
            else params.add(key, value)
        })
    }

    $.param = function(obj, traditional) {
        var params = []
        params.add = function(k, v) { this.push(escape(k) + '=' + escape(v)) }
        serialize(params, obj, traditional)
        return params.join('&').replace(/%20/g, '+')
    }
})(Zepto)

;
(function($) {
    $.fn.serializeArray = function() {
        var result = [],
            el
        $([].slice.call(this.get(0).elements)).each(function() {
            el = $(this)
            var type = el.attr('type')
            if (this.nodeName.toLowerCase() != 'fieldset' &&
                !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
                ((type != 'radio' && type != 'checkbox') || this.checked))
                result.push({
                    name: el.attr('name'),
                    value: el.val()
                })
        })
        return result
    }

    $.fn.serialize = function() {
        var result = []
        this.serializeArray().forEach(function(elm) {
            result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
        })
        return result.join('&')
    }

    $.fn.submit = function(callback) {
        if (callback) this.bind('submit', callback)
        else if (this.length) {
            var event = $.Event('submit')
            this.eq(0).trigger(event)
            if (!event.isDefaultPrevented()) this.get(0).submit()
        }
        return this
    }

})(Zepto)

;
(function($) {
    // __proto__ doesn't exist on IE<11, so redefine
    // the Z function to use object extension instead
    if (!('__proto__' in {})) {
        $.extend($.zepto, {
            Z: function(dom, selector) {
                dom = dom || []
                $.extend(dom, $.fn)
                dom.selector = selector || ''
                dom.__Z = true
                return dom
            },
            // this is a kludge but works
            isZ: function(object) {
                return $.type(object) === 'array' && '__Z' in object
            }
        })
    }

    // getComputedStyle shouldn't freak out when called
    // without a valid element as argument
    try {
        getComputedStyle(undefined)
    } catch (e) {
        var nativeGetComputedStyle = getComputedStyle;
        window.getComputedStyle = function(element, pseudoElement) {
            try {
                return nativeGetComputedStyle(element, pseudoElement)
            } catch (e) {
                return null
            }
        }
    }
})(Zepto)

const getJSON = Zepto.getJSON;
const ajax = Zepto.ajax;
const fetchJSON = Zepto.fetchJSON;

//     Based on https://github.com/madrobby/zepto/blob/5585fe00f1828711c04208372265a5d71e3238d1/src/ajax.js
//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
/*
Copyright (c) 2010-2012 Thomas Fuchs
http://zeptojs.com

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to deal 
in the Software without restriction, including without limitation the rights 
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
*/

/***/ }),

/***/ "./src/js/slider/Slide.js":
/*!********************************!*\
  !*** ./src/js/slider/Slide.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Slide: () => (/* binding */ Slide)
/* harmony export */ });
/* harmony import */ var wicg_inert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! wicg-inert */ "./node_modules/wicg-inert/dist/inert.esm.js");
/* harmony import */ var wicg_inert__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(wicg_inert__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _language_I18NMixins__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../language/I18NMixins */ "./src/js/language/I18NMixins.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../dom/DOMMixins */ "./src/js/dom/DOMMixins.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");
/* harmony import */ var _animation_Animate__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../animation/Animate */ "./src/js/animation/Animate.js");
/* harmony import */ var _animation_Ease__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../animation/Ease */ "./src/js/animation/Ease.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/Browser */ "./src/js/core/Browser.js");
/* harmony import */ var _media_MediaType__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../media/MediaType */ "./src/js/media/MediaType.js");
/* harmony import */ var _media_Media__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../media/Media */ "./src/js/media/Media.js");













class Slide {

    constructor(data, options, title_slide, language) {
        if (language) {
            this.setLanguage(language)
        }

        // DOM Elements
        this._el = {
            container: {},
            scroll_container: {},
            background: {},
            content_container: {},
            content: {}
        };

        // Components
        this._media = null;
        this._mediaclass = {};
        this._text = {};
        this._background_media = null;

        // State
        this._state = {
            loaded: false
        };

        this.has = {
            headline: false,
            text: false,
            media: false,
            title: false,
            background: {
                image: false,
                color: false,
                color_value: ""
            }
        }

        this.has.title = title_slide;

        // Data
        this.data = {
            unique_id: null,
            background: null,
            start_date: null,
            end_date: null,
            location: null,
            text: null,
            media: null,
            autolink: true
        };

        // Options
        this.options = {
            // animation
            duration: 1000,
            slide_padding_lr: 40,
            ease: _animation_Ease__WEBPACK_IMPORTED_MODULE_7__.easeInSpline,
            width: 600,
            height: 600,
            skinny_size: 650,
            media_name: ""
        };

        // Actively Displaying
        this.active = false;

        // Animation Object
        this.animator = {};

        // Merge Data and Options
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_4__.mergeData)(this.options, options);
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_4__.mergeData)(this.data, data);

        this._initLayout();
        this._initEvents();


    }

    /*	Adding, Hiding, Showing etc
    ================================================== */
    show() {
        this.animator = (0,_animation_Animate__WEBPACK_IMPORTED_MODULE_6__.Animate)(this._el.slider_container, {
            left: -(this._el.container.offsetWidth * n) + "px",
            duration: this.options.duration,
            easing: this.options.ease
        });
    }

    hide() {

    }

    setActive(is_active) {
        this.active = is_active;

        if (this.active) {
            if (this.data.background) {
                this.fire("background_change", this.has.background);
            }
            this._setInteractive(true)
            this.loadMedia();
        } else {
            this.stopMedia();
            this._setInteractive(false)
        }
    }

    addTo(container) {
        container.appendChild(this._el.container);
        //this.onAdd();
    }

    removeFrom(container) {
        container.removeChild(this._el.container);
    }

    updateDisplay(width, height, layout) {
        var content_width,
            content_padding_left = this.options.slide_padding_lr,
            content_padding_right = this.options.slide_padding_lr;

        if (width) {
            this.options.width = width;
        } else {
            this.options.width = this._el.container.offsetWidth;
        }

        content_width = this.options.width - (this.options.slide_padding_lr * 2);

        if (_core_Browser__WEBPACK_IMPORTED_MODULE_8__.mobile && (this.options.width <= this.options.skinny_size)) {
            content_padding_left = 0;
            content_padding_right = 0;
            content_width = this.options.width;
        } else if (layout == "landscape") {

        } else if (this.options.width <= this.options.skinny_size) {
            content_padding_left = 50;
            content_padding_right = 50;
            content_width = this.options.width - content_padding_left - content_padding_right;
        } else {

        }

        this._el.content.style.paddingLeft = content_padding_left + "px";
        this._el.content.style.paddingRight = content_padding_right + "px";
        this._el.content.style.width = content_width + "px";

        if (height) {
            this.options.height = height;
            //this._el.scroll_container.style.height		= this.options.height + "px";

        } else {
            this.options.height = this._el.container.offsetHeight;
        }

        if (this._media) {

            if (!this.has.text && this.has.headline) {
                this._media.updateDisplay(content_width, (this.options.height - this._text.headlineHeight()), layout);
            } else if (!this.has.text && !this.has.headline) {
                this._media.updateDisplay(content_width, this.options.height, layout);
            } else if (this.options.width <= this.options.skinny_size) {
                this._media.updateDisplay(content_width, this.options.height, layout);
            } else {
                this._media.updateDisplay(content_width / 2, this.options.height, layout);
            }
        }

        this._updateBackgroundDisplay();
    }

    loadMedia() {
        var self = this;

        if (this._media && !this._state.loaded) {
            this._media.loadMedia();
            this._state.loaded = true;
        }

        if (this._background_media && !this._background_media._state.loaded) {
            this._background_media.on("loaded", function() {
                self._updateBackgroundDisplay();
            });
            this._background_media.loadMedia();
        }
    }

    stopMedia() {
        if (this._media && this._state.loaded) {
            this._media.stopMedia();
        }
    }

    getBackground() {
        return this.has.background;
    }

    scrollToTop() {
        this._el.container.scrollTop = 0;
    }

    getFormattedDate() {

        if ((0,_core_Util__WEBPACK_IMPORTED_MODULE_4__.trim)(this.data.display_date).length > 0) {
            return this.data.display_date;
        }
        var date_text = "";

        if (!this.has.title) {
            if (this.data.end_date) {
                date_text = " &mdash; " + this.data.end_date.getDisplayDate(this.getLanguage());
            }
            if (this.data.start_date) {
                date_text = this.data.start_date.getDisplayDate(this.getLanguage()) + date_text;
            }
        }
        return date_text;
    }

    /*	Events
    ================================================== */


    /*	Private Methods
    ================================================== */
    _initLayout() {
        // Create Layout
        this._el.container = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-slide");

        if (this.has.title) {
            this._el.container.className = "tl-slide tl-slide-titleslide";
        }

        if (this.data.unique_id) {
            this._el.container.id = this.data.unique_id;
        }
        this._el.scroll_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-slide-scrollable-container", this._el.container);
        this._el.content_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-slide-content-container", this._el.scroll_container);
        this._el.content = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-slide-content", this._el.content_container);
        this._el.background = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-slide-background", this._el.container);
        // Style Slide Background
        if (this.data.background) {
            if (this.data.background.url) {
                var media_type = (0,_media_MediaType__WEBPACK_IMPORTED_MODULE_9__.lookupMediaType)(this.data.background, true);
                if (media_type) {
                    this._background_media = new media_type.cls(this.data.background, { background: 1 });

                    this.has.background.image = true;
                    this._el.container.className += ' tl-full-image-background';
                    this.has.background.color_value = "#000";
                    this._el.background.style.display = "block";
                }
                if (this.data.background.alt) {
                    this._el.background.setAttribute('role', 'img');
                    this._el.background.setAttribute('aria-label', this.data.background.alt);
                }
            }
            if (this.data.background.color) {
                this.has.background.color = true;
                this._el.container.className += ' tl-full-color-background';
                this.has.background.color_value = this.data.background.color;
                //this._el.container.style.backgroundColor = this.data.background.color;
                //this._el.background.style.backgroundColor 	= this.data.background.color;
                //this._el.background.style.display 			= "block";
            }
            if (this.data.background.text_background) {
                this._el.container.className += ' tl-text-background';
            }

        }



        // Determine Assets for layout and loading
        if (this.data.media && this.data.media.url && this.data.media.url != "") {
            this.has.media = true;
        }
        if (this.data.text && this.data.text.text) {
            this.has.text = true;
        }
        if (this.data.text && this.data.text.headline) {
            this.has.headline = true;
        }

        // Create Media
        if (this.has.media) {
            // Determine the media type
            this.data.media.mediatype = (0,_media_MediaType__WEBPACK_IMPORTED_MODULE_9__.lookupMediaType)(this.data.media);
            this.options.media_name = this.data.media.mediatype.name;
            this.options.media_type = this.data.media.mediatype.type;
            this.options.autolink = this.data.autolink;

            // Create a media object using the matched class name
            this._media = new this.data.media.mediatype.cls(this.data.media, this.options, this.getLanguage());
        }

        // Create Text
        if (this.has.text || this.has.headline) {
            this._text = new _media_Media__WEBPACK_IMPORTED_MODULE_10__.Text(this.data.text, { title: this.has.title, language: this.getLanguage(), autolink: this.data.autolink });
            this._text.addDateText(this.getFormattedDate());
        }



        // Add to DOM
        if (!this.has.text && !this.has.headline && this.has.media) {
            this._el.container.classList.add('tl-slide-media-only');
            this._media.addTo(this._el.content);
        } else if (this.has.headline && this.has.media && !this.has.text) {
            this._el.container.classList.add('tl-slide-media-only');
            this._text.addTo(this._el.content);
            this._media.addTo(this._el.content);
        } else if (this.has.text && this.has.media) {
            this._text.addTo(this._el.content);
            this._media.addTo(this._el.content);
        } else if (this.has.text || this.has.headline) {
            this._el.container.classList.add('tl-slide-text-only');
            this._text.addTo(this._el.content);
        }

        // Fire event that the slide is loaded
        this.onLoaded();

    }

    _initEvents() {

    }

    _updateBackgroundDisplay() {
        if (this._background_media && this._background_media._state.loaded) {
            this._el.background.style.backgroundImage = "url('" + this._background_media.getImageURL(this.options.width, this.options.height) + "')";
        }
    }

    _setInteractive(is_interactive) {
        if (is_interactive) {
            this._el.container.removeAttribute('inert');
        } else {
            this._el.container.setAttribute('inert', true);
        }
    }
}
(0,_core_Util__WEBPACK_IMPORTED_MODULE_4__.classMixin)(Slide, _language_I18NMixins__WEBPACK_IMPORTED_MODULE_1__.I18NMixins, _core_Events__WEBPACK_IMPORTED_MODULE_2__["default"], _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_3__.DOMMixins)

/***/ }),

/***/ "./src/js/slider/SlideNav.js":
/*!***********************************!*\
  !*** ./src/js/slider/SlideNav.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SlideNav: () => (/* binding */ SlideNav)
/* harmony export */ });
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../dom/DOMMixins */ "./src/js/dom/DOMMixins.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");
/* harmony import */ var _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../dom/DOMEvent */ "./src/js/dom/DOMEvent.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Browser */ "./src/js/core/Browser.js");







class SlideNav {
	
	constructor(data, options, add_to_container) {
		// DOM ELEMENTS
		this._el = {
			container: {},
			content_container: {},
			icon: {},
			title: {},
			description: {}
		};
	
		// Media Type
		this.mediatype = {};
		
		// Data
		this.data = {
			title: "Navigation",
			description: "Description",
			date: "Date"
		};
	
		//Options
		this.options = {
			direction: 			"previous"
		};
	
		this.animator = null;
		
		// Merge Data and Options
		(0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.mergeData)(this.options, options);
		(0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.mergeData)(this.data, data);
		
		
		this._el.container = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.createButton("tl-slidenav-" + this.options.direction);
		
		if (_core_Browser__WEBPACK_IMPORTED_MODULE_5__.mobile) {
			this._el.container.setAttribute("ontouchstart"," ");
		}
		
		this._initLayout();
		this._initEvents();
		
		if (add_to_container) {
			add_to_container.appendChild(this._el.container);
		};
		
	}
	
	/*	Update Content
	================================================== */
	update(slide) {
		var d = {
			title: "",
			description: "",
			date: slide.getFormattedDate()
		};
		
		if (slide.data.text) {
			if (slide.data.text.headline) {
				d.title = slide.data.text.headline;
			}
		}

		this._update(d);
	}
	
	/*	Color
	================================================== */
	setColor(inverted) {
		if (inverted) {
			this._el.content_container.className = 'tl-slidenav-content-container tl-slidenav-inverted';
		} else {
			this._el.content_container.className = 'tl-slidenav-content-container';
		}
	}
	
	/*	Events
	================================================== */
	_onMouseClick() {
		this.fire("clicked", this.options);
	}
	
	/*	Private Methods
	================================================== */
	_update(d) {
		// update data
		this.data = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.mergeData)(this.data, d);

        // Title
        const title = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.unlinkify)(this.data.title);
        this._el.title.innerHTML = title;

        // Date
        const date = (0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.unlinkify)(this.data.date);
        this._el.description.innerHTML = date;

        // Alternative text
        this._el.container.setAttribute('aria-label', `${this.options.direction}, ${title}, ${date}`)
	}
	
	_initLayout () {
		
		// Create Layout
		this._el.content_container			= _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-slidenav-content-container", this._el.container);
		this._el.icon						= _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-slidenav-icon", this._el.content_container);
		this._el.title = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-slidenav-title", this._el.content_container);
		this._el.description = _dom_DOM__WEBPACK_IMPORTED_MODULE_3__.create("div", "tl-slidenav-description", this._el.content_container);
		
		// this._el.icon.innerHTML				= "&nbsp;"
		
		this._update();
	}
	
	_initEvents () {
		_dom_DOMEvent__WEBPACK_IMPORTED_MODULE_4__.DOMEvent.addListener(this._el.container, 'click', this._onMouseClick, this);
	}
	
	
}

(0,_core_Util__WEBPACK_IMPORTED_MODULE_2__.classMixin)(SlideNav, _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_1__.DOMMixins, _core_Events__WEBPACK_IMPORTED_MODULE_0__["default"])


/***/ }),

/***/ "./src/js/slider/StorySlider.js":
/*!**************************************!*\
  !*** ./src/js/slider/StorySlider.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StorySlider: () => (/* binding */ StorySlider)
/* harmony export */ });
/* harmony import */ var _language_I18NMixins__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../language/I18NMixins */ "./src/js/language/I18NMixins.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _animation_Ease__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../animation/Ease */ "./src/js/animation/Ease.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _animation_Animate__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../animation/Animate */ "./src/js/animation/Animate.js");
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");
/* harmony import */ var _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../dom/DOMEvent */ "./src/js/dom/DOMEvent.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/Browser */ "./src/js/core/Browser.js");
/* harmony import */ var _ui_Swipable__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../ui/Swipable */ "./src/js/ui/Swipable.js");
/* harmony import */ var _ui_Message__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../ui/Message */ "./src/js/ui/Message.js");
/* harmony import */ var _Slide__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Slide */ "./src/js/slider/Slide.js");
/* harmony import */ var _SlideNav__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./SlideNav */ "./src/js/slider/SlideNav.js");













class StorySlider {
    constructor(elem, data, options, language) {

        if (language) {
            this.setLanguage(language)
        }

        // DOM ELEMENTS
        this._el = {
            container: {},
            background: {},
            slider_container_mask: {},
            slider_container: {},
            slider_item_container: {}
        };

        this._nav = {};
        this._nav.previous = {};
        this._nav.next = {};

        // Slide Spacing
        this.slide_spacing = 0;

        // Slides Array
        this._slides = [];

        // Swipe Object
        this._swipable;

        // Preload Timer
        this.preloadTimer;

        // Message
        this._message;

        // Current Slide
        this.current_id = '';

        // Data Object
        this.data = {};

        this.options = {
            id: "",
            layout: "portrait",
            width: 600,
            height: 600,
            default_bg_color: { r: 255, g: 255, b: 255 },
            slide_padding_lr: 40, // padding on slide of slide
            start_at_slide: 1,
            slide_default_fade: "0%", // landscape fade
            // animation
            duration: 1000,
            ease: _animation_Ease__WEBPACK_IMPORTED_MODULE_2__.easeInOutQuint,
            // interaction
            dragging: true,
            trackResize: true
        };

        // Main element ID
        if (typeof elem === 'object') {
            this._el.container = elem;
            this.options.id = (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.unique_ID)(6, "tl");
        } else {
            this.options.id = elem;
            this._el.container = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.get(elem);
        }

        if (!this._el.container.id) {
            this._el.container.id = this.options.id;
        }

        // Animation Object
        this.animator = null;

        // Merge Data and Options
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.mergeData)(this.options, options);
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.mergeData)(this.data, data);

    }

    init() {
        this._initLayout();
        this._initEvents();
        this._initData();
        this.updateDisplay();

        // Go to initial slide
        this.goTo(this.options.start_at_slide);

        this._onLoaded();
    }

    /* Slides
    ================================================== */
    _addSlide(slide) {
        slide.addTo(this._el.slider_item_container);
        slide.on('added', this._onSlideAdded, this);
        slide.on('background_change', this._onBackgroundChange, this);
    }

    _createSlide(d, title_slide, n) {
        var slide = new _Slide__WEBPACK_IMPORTED_MODULE_10__.Slide(d, this.options, title_slide, this.getLanguage());
        this._addSlide(slide);
        if (n < 0) {
            this._slides.push(slide);
        } else {
            this._slides.splice(n, 0, slide);
        }
    }

    _createSlides(array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].unique_id == "") {
                array[i].unique_id = (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.unique_ID)(6, "tl-slide");
            }
            this._createSlide(array[i], false, -1);
        }
    }

    _removeSlide(slide) {
        slide.removeFrom(this._el.slider_item_container);
        slide.off('added', this._onSlideRemoved, this);
        slide.off('background_change', this._onBackgroundChange);
    }

    _destroySlide(n) {
        this._removeSlide(this._slides[n]);
        this._slides.splice(n, 1);
    }

    _findSlideIndex(n) {
        var _n = n;
        if (typeof n == 'string' || n instanceof String) {
            _n = (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.findArrayNumberByUniqueID)(n, this._slides, "unique_id");
        }
        return _n;
    }

    /*	Public
    ================================================== */
    updateDisplay(width, height, animate, layout) {
        var nav_pos, _layout;

        if (typeof layout === 'undefined') {
            _layout = this.options.layout;
        } else {
            _layout = layout;
        }

        this.options.layout = _layout;

        if (width) {
            this.options.width = width;
        } else {
            this.options.width = this._el.container.offsetWidth;
        }

        if (height) {
            this.options.height = height;
        } else {
            this.options.height = this._el.container.offsetHeight;
        }

        this.slide_spacing = this.options.width * 2;

        // position navigation
        nav_pos = (this.options.height / 2);
        this._nav.next.setPosition({ top: nav_pos });
        this._nav.previous.setPosition({ top: nav_pos });


        // Position slides
        for (var i = 0; i < this._slides.length; i++) {
            this._slides[i].updateDisplay(this.options.width, this.options.height, _layout);
            this._slides[i].setPosition({ left: (this.slide_spacing * i), top: 0 });

        };

        // Go to the current slide
        this.goToId(this.current_id, true, true);
    }


    // Create a slide
    createSlide(d, n) {
        this._createSlide(d, false, n);
    }

    // Create Many Slides from an array
    createSlides(array) {
        this._createSlides(array);
    }

    // Destroy slide by index
    destroySlide(n) {
        this._destroySlide(n);
    }

    // Destroy slide by id
    destroySlideId(id) {
        this.destroySlide(this._findSlideIndex(id));
    }

    /*	Navigation
    ================================================== */
    goTo(n, fast, displayupdate) {
        n = parseInt(n);
        if (isNaN(n)) n = 0;

        var self = this;

        this.changeBackground({ color_value: "", image: false });

        // Clear Preloader Timer
        if (this.preloadTimer) {
            clearTimeout(this.preloadTimer);
        }

        // Set Slide Active State
        for (var i = 0; i < this._slides.length; i++) {
            this._slides[i].setActive(false);
        }

        if (n < this._slides.length && n >= 0) {
            this.current_id = this._slides[n].data.unique_id;

            // Stop animation
            if (this.animator) {
                this.animator.stop();
            }
            if (this._swipable) {
                this._swipable.stopMomentum();
            }

            if (fast) {
                this._el.slider_container.style.left = -(this.slide_spacing * n) + "px";
                this._onSlideChange(displayupdate);
            } else {
                this.animator = (0,_animation_Animate__WEBPACK_IMPORTED_MODULE_4__.Animate)(this._el.slider_container, {
                    left: -(this.slide_spacing * n) + "px",
                    duration: this.options.duration,
                    easing: this.options.ease,
                    complete: this._onSlideChange(displayupdate)
                });
            }

            // Set Slide Active State
            this._slides[n].setActive(true);

            // Update Navigation and Info
            if (this._slides[n + 1]) {
                this.showNav(this._nav.next, true);
                this._nav.next.update(this._slides[n + 1]);
            } else {
                this.showNav(this._nav.next, false);
            }
            if (this._slides[n - 1]) {
                this.showNav(this._nav.previous, true);
                this._nav.previous.update(this._slides[n - 1]);
            } else {
                this.showNav(this._nav.previous, false);
            }

            // Preload Slides
            this.preloadTimer = setTimeout(function() {
                self.preloadSlides(n);
            }, this.options.duration);
        }
    }

    goToId(id, fast, displayupdate) {
        this.goTo(this._findSlideIndex(id), fast, displayupdate);
    }

    preloadSlides(n) {
        if (this._slides[n + 1]) {
            this._slides[n + 1].loadMedia();
            this._slides[n + 1].scrollToTop();
        }
        if (this._slides[n + 2]) {
            this._slides[n + 2].loadMedia();
            this._slides[n + 2].scrollToTop();
        }
        if (this._slides[n - 1]) {
            this._slides[n - 1].loadMedia();
            this._slides[n - 1].scrollToTop();
        }
        if (this._slides[n - 2]) {
            this._slides[n - 2].loadMedia();
            this._slides[n - 2].scrollToTop();
        }
    }

    next() {
        var n = this._findSlideIndex(this.current_id);
        if ((n + 1) < (this._slides.length)) {
            this.goTo(n + 1);
        } else {
            this.goTo(n);
        }
    }

    previous() {
        var n = this._findSlideIndex(this.current_id);
        if (n - 1 >= 0) {
            this.goTo(n - 1);
        } else {
            this.goTo(n);
        }
    }

    showNav(nav_obj, show) {

        if (this.options.width <= 500 && _core_Browser__WEBPACK_IMPORTED_MODULE_7__.mobile) {
            nav_obj.hide();
        } else {
            if (show) {
                nav_obj.show();
            } else {
                nav_obj.hide();
            }

        }
    }



    changeBackground(bg) {
            var bg_color = { r: 256, g: 256, b: 256 },
                bg_color_rgb;

            if (bg.color_value && bg.color_value != "") {
                bg_color = (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.hexToRgb)(bg.color_value);
                if (!bg_color) {
                    (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.trace)("Invalid color value " + bg.color_value);
                    bg_color = this.options.default_bg_color;
                }
            } else {
                bg_color = this.options.default_bg_color;
                bg.color_value = "rgb(" + bg_color.r + " , " + bg_color.g + ", " + bg_color.b + ")";
            }

            bg_color_rgb = bg_color.r + "," + bg_color.g + "," + bg_color.b;
            this._el.background.style.backgroundImage = "none";


            if (bg.color_value) {
                this._el.background.style.backgroundColor = bg.color_value;
            } else {
                this._el.background.style.backgroundColor = "transparent";
            }

            if (bg_color.r < 255 || bg_color.g < 255 || bg_color.b < 255 || bg.image) {
                this._nav.next.setColor(true);
                this._nav.previous.setColor(true);
            } else {
                this._nav.next.setColor(false);
                this._nav.previous.setColor(false);
            }
        }
        /*	Private Methods
        ================================================== */

    // Update Display

    // Reposition and redraw slides
    _updateDrawSlides() {
        var _layout = this.options.layout;

        for (var i = 0; i < this._slides.length; i++) {
            this._slides[i].updateDisplay(this.options.width, this.options.height, _layout);
            this._slides[i].setPosition({ left: (this.slide_spacing * i), top: 0 });
        };

        this.goToId(this.current_id, true, false);
    }


    /*	Init
    ================================================== */
    _initLayout() {

        this._el.container.classList.add('tl-storyslider');

        // Create Navigation
        this._nav.previous = new _SlideNav__WEBPACK_IMPORTED_MODULE_11__.SlideNav({ title: "Previous", description: "description" }, { direction: "previous" }, this._el.container);
        this._nav.next = new _SlideNav__WEBPACK_IMPORTED_MODULE_11__.SlideNav({ title: "Next", description: "description" }, { direction: "next" }, this._el.container);

        // Create Layout
        this._el.slider_container_mask = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create('div', 'tl-slider-container-mask', this._el.container);
        this._el.background = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create('div', 'tl-slider-background tl-animate', this._el.container);
        this._el.slider_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create('div', 'tl-slider-container tlanimate', this._el.slider_container_mask);
        this._el.slider_item_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create('div', 'tl-slider-item-container', this._el.slider_container);

        // Add aria-live polite to slide_container
        this._el.slider_container.setAttribute('aria-live', 'polite');

        // Update Size
        this.options.width = this._el.container.offsetWidth;
        this.options.height = this._el.container.offsetHeight;

        this._el.slider_container.style.left = "0px";

        if (_core_Browser__WEBPACK_IMPORTED_MODULE_7__.touch) {
            //this._el.slider_touch_mask = DOM.create('div', 'tl-slider-touch-mask', this._el.slider_container_mask);
            this._swipable = new _ui_Swipable__WEBPACK_IMPORTED_MODULE_8__["default"](this._el.slider_container_mask, this._el.slider_container, {
                enable: { x: true, y: false },
                snap: true
            });
            this._swipable.enable();

            // Message
            this._message = new _ui_Message__WEBPACK_IMPORTED_MODULE_9__["default"](this._el.container, {
                    message_class: "tl-message-full",
                    message_icon_class: "tl-icon-swipe-left"
                },
                this.getLanguage());
            this._message.updateMessage(this._("swipe_to_navigate"));
            this._message.addTo(this._el.container);
        }

    }

    _initEvents() {
        this._nav.next.on('clicked', this._onNavigation, this);
        this._nav.previous.on('clicked', this._onNavigation, this);

        if (this._message) {
            this._message.on('clicked', this._onMessageClick, this);
        }

        if (this._swipable) {
            this._swipable.on('swipe_left', this._onNavigation, this);
            this._swipable.on('swipe_right', this._onNavigation, this);
            this._swipable.on('swipe_nodirection', this._onSwipeNoDirection, this);
        }


    }

    _initData() {
        if (this.data.title) {
            this._createSlide(this.data.title, true, -1);
        }
        this._createSlides(this.data.events);
    }

    /*	Events
    ================================================== */
    _onBackgroundChange(e) {
        var n = this._findSlideIndex(this.current_id);
        var slide_background = this._slides[n].getBackground();
        this.changeBackground(e);
        this.fire("colorchange", slide_background);
    }

    _onMessageClick(e) {
        this._message.hide();
    }

    _onSwipeNoDirection(e) {
        this.goToId(this.current_id);
    }

    _onNavigation(e) {

        if (e.direction == "next" || e.direction == "left") {
            this.next();
        } else if (e.direction == "previous" || e.direction == "right") {
            this.previous();
        }
        this.fire("nav_" + e.direction, this.data);
    }

    _onSlideAdded(e) {
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.trace)("slideadded")
        this.fire("slideAdded", this.data);
    }

    _onSlideRemoved(e) {
        this.fire("slideRemoved", this.data);
    }

    _onSlideChange(displayupdate) {
        if (!displayupdate) {
            this.fire("change", { unique_id: this.current_id });
        }
    }

    _onMouseClick(e) {

    }

    _fireMouseEvent(e) {
        if (!this._loaded) {
            return;
        }

        var type = e.type;
        type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));

        if (!this.hasEventListeners(type)) {
            return;
        }

        if (type === 'contextmenu') {
            _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_6__.DOMEvent.preventDefault(e);
        }

        this.fire(type, {
            latlng: "something", //this.mouseEventToLatLng(e),
            layerPoint: "something else" //this.mouseEventToLayerPoint(e)
        });
    }

    _onLoaded() {
        this.fire("loaded", this.data);
    }


}

(0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.classMixin)(StorySlider, _language_I18NMixins__WEBPACK_IMPORTED_MODULE_0__.I18NMixins, _core_Events__WEBPACK_IMPORTED_MODULE_1__["default"])


/***/ }),

/***/ "./src/js/timeline/Timeline.js":
/*!*************************************!*\
  !*** ./src/js/timeline/Timeline.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Timeline: () => (/* binding */ Timeline),
/* harmony export */   exportJSON: () => (/* binding */ exportJSON)
/* harmony export */ });
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _animation_Ease__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../animation/Ease */ "./src/js/animation/Ease.js");
/* harmony import */ var _ui_Message__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../ui/Message */ "./src/js/ui/Message.js");
/* harmony import */ var _language_Language__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../language/Language */ "./src/js/language/Language.js");
/* harmony import */ var _language_I18NMixins__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../language/I18NMixins */ "./src/js/language/I18NMixins.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _core_ConfigFactory__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/ConfigFactory */ "./src/js/core/ConfigFactory.js");
/* harmony import */ var _core_TimelineConfig__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/TimelineConfig */ "./src/js/core/TimelineConfig.js");
/* harmony import */ var _timenav_TimeNav__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../timenav/TimeNav */ "./src/js/timenav/TimeNav.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/Browser */ "./src/js/core/Browser.js");
/* harmony import */ var _animation_Animate__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../animation/Animate */ "./src/js/animation/Animate.js");
/* harmony import */ var _slider_StorySlider__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../slider/StorySlider */ "./src/js/slider/StorySlider.js");
/* harmony import */ var _ui_MenuBar__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../ui/MenuBar */ "./src/js/ui/MenuBar.js");
/* harmony import */ var _core_Load__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../core/Load */ "./src/js/core/Load.js");
















let script_src_url = null;
if (document) {
    let script_tags = document.getElementsByTagName('script');
    if (script_tags && script_tags.length > 0) {
        script_src_url = script_tags[script_tags.length - 1].src;
    }
}

function make_keydown_handler(timeline) {
    return function(event) {
        if (timeline.config) {
            var keyName = event.key;
            var currentSlide = timeline._getSlideIndex(self.current_id);
            var _n = timeline.config.events.length - 1;
            var lastSlide = timeline.config.title ? _n + 1 : _n;
            var firstSlide = 0;

            if (keyName == 'ArrowLeft') {
                if (currentSlide != firstSlide) {
                    timeline.goToPrev();
                }
            } else if (keyName == 'ArrowRight') {
                if (currentSlide != lastSlide) {
                    timeline.goToNext();
                }
            }
        }
    }
}

/**
 * Primary entry point for using TimelineJS.
 * @constructor
 * @param {HTMLElement|string} elem - the HTML element, or its ID, to which 
 *     the Timeline should be bound
 * @param {object|String} - a JavaScript object conforming to the TimelineJS
 *     configuration format, or a String which is the URL for a Google Sheets document
 *     or JSON configuration file which Timeline will retrieve and parse into a JavaScript object.
 *     NOTE: do not pass a JSON String for this. TimelineJS doesn't try to distinguish a 
 *     JSON string from a URL string. If you have a JSON String literal, parse it using
 *     `JSON.parse` before passing it to the constructor.
 *
 * @param {object} [options] - a JavaScript object specifying 
 *     presentation options
 */
class Timeline {
    constructor(elem, data, options) {
        if (!options) {
            options = {}
        }
        this.ready = false;
        this._el = {
            container: _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.get(elem),
            storyslider: {},
            timenav: {},
            menubar: {}
        };

        if (options.lang && !options.language) {
            options.language = options.lang;
        }

        /** @type {Language} */
        this.language = _language_Language__WEBPACK_IMPORTED_MODULE_4__.fallback;

        /** @type {StorySlider} */
        this._storyslider = {};

        /** @type {TimeNav} */
        this._timenav = {};

        /** @type {MenuBar} */
        this._menubar = {};

        // Loaded State
        this._loaded = { storyslider: false, timenav: false };

        /** @type {TimelineConfig} */
        this.config = null;

        this.options = {
            script_path: "https://cdn.knightlab.com/libs/timeline3/latest/js/", // as good a default as any
            height: this._el.container.offsetHeight,
            width: this._el.container.offsetWidth,
            debug: false,
            font: 'default',
            is_embed: false,
            is_full_embed: false,
            hash_bookmark: false,
            default_bg_color: { r: 255, g: 255, b: 255 },
            scale_factor: 2, // How many screen widths wide should the timeline be
            layout: "landscape", // portrait or landscape
            timenav_position: "bottom", // timeline on top or bottom
            optimal_tick_width: 60, // optimal distance (in pixels) between ticks on axis
            base_class: "tl-timeline", // removing tl-timeline will break all default stylesheets...
            timenav_height: null,
            timenav_height_percentage: 25, // Overrides timenav height as a percentage of the screen
            timenav_mobile_height_percentage: 40, // timenav height as a percentage on mobile devices
            timenav_height_min: 175, // Minimum timenav height
            marker_height_min: 30, // Minimum Marker Height
            marker_width_min: 100, // Minimum Marker Width
            marker_padding: 5, // Top Bottom Marker Padding
            start_at_slide: 0,
            start_at_end: false,
            menubar_height: 0,
            skinny_size: 650,
            medium_size: 800,
            use_bc: false, // Use declared suffix on dates earlier than 0
            // animation
            duration: 1000,
            ease: _animation_Ease__WEBPACK_IMPORTED_MODULE_2__.easeInOutQuint,
            // interaction
            dragging: true,
            trackResize: true,
            map_type: "stamen:toner-lite",
            slide_padding_lr: 100, // padding on slide of slide
            slide_default_fade: "0%", // landscape fade
            zoom_sequence: [0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89], // Array of Fibonacci numbers for TimeNav zoom levels
            language: "en",
            ga_measurement_id: null,
            ga_property_id: null,
            track_events: ['back_to_start', 'nav_next', 'nav_previous', 'zoom_in', 'zoom_out'],
            theme: null,
            // sheets_proxy value should be suitable for simply postfixing with the Google Sheets CSV URL
            // as in include trailing slashes, or '?url=' or whatever. No support right now for anything but
            // postfixing. The default proxy should work in most cases, but only for TimelineJS sheets.
            sheets_proxy: 'https://sheets-proxy.knightlab.com/proxy/',
            soundcite: false,
        };

        // Animation Objects
        this.animator_timenav = null;
        this.animator_storyslider = null;
        this.animator_menubar = null;

        // Ideally we'd set the language here, but we're bootstrapping and may hit problems
        // before we're able to load it. if it weren't a remote resource, we could probably 
        // do it.
        this.message = new _ui_Message__WEBPACK_IMPORTED_MODULE_3__["default"](this._el.container, { message_class: "tl-message-full" });

        // Merge Options
        if (typeof(options.default_bg_color) == "string") {
            var parsed = (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.hexToRgb)(options.default_bg_color); // will clear it out if its invalid
            if (parsed) {
                options.default_bg_color = parsed;
            } else {
                delete options.default_bg_color
                ;(0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.trace)("Invalid default background color. Ignoring.");
            }
        }
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.mergeData)(this.options, options);

        if (!(this.options.script_path)) {
            this.options.script_path = this.determineScriptPath()
        }

        if (options.soundcite) {
            this.on('ready', () => {
                (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.trace)("Loading Soundcite resources ")
                ;(0,_core_Load__WEBPACK_IMPORTED_MODULE_14__.loadCSS)('https://cdn.knightlab.com/libs/soundcite/latest/css/player.css')
                ;(0,_core_Load__WEBPACK_IMPORTED_MODULE_14__.loadJS)('https://cdn.knightlab.com/libs/soundcite/latest/js/soundcite.min.js')
            })
        }

        // load font, theme
        this._loadStyles()


        document.addEventListener("keydown", make_keydown_handler(this));
        window.addEventListener("resize", function(e) {
            this.updateDisplay();
        }.bind(this));

        if (this.options.debug) {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.addTraceHandler)(console.log)
        }

        // Apply base class to container
        this._el.container.classList.add('tl-timeline');
        this._el.container.setAttribute('tabindex', '0');
        this._el.container.setAttribute('role', 'region');
        this._el.container.setAttribute('aria-label', this._('aria_label_timeline'));

        if (this.options.is_embed) {
            this._el.container.classList.add('tl-timeline-embed');
        }

        if (this.options.is_full_embed) {
            this._el.container.classList.add('tl-timeline-full-embed');
        }

        this._loadLanguage(data);

    }

    _loadStyles() {
        let font_css_url = null,
            theme_css_url = null;

        if (this.options.font && (
                this.options.font.indexOf('http') == 0 ||
                this.options.font.match(/\.css$/))) {
            font_css_url = this.options.font
        } else if (this.options.font) {
            let fragment = '../css/fonts/font.' + this.options.font.toLowerCase() + '.css'
            font_css_url = new URL(fragment, this.options.script_path).toString()
        }

        if (font_css_url) {
            (0,_core_Load__WEBPACK_IMPORTED_MODULE_14__.loadCSS)(font_css_url)
        }

        if (this.options.theme && (
                this.options.theme.indexOf('http') == 0 ||
                this.options.theme.match(/\.css$/))) {
            theme_css_url = this.options.theme
        } else if (this.options.theme) {
            let fragment = '../css/themes/timeline.theme.' + this.options.theme.toLowerCase() + '.css'
            theme_css_url = new URL(fragment, this.options.script_path).toString()
        }

        if (theme_css_url) {
            (0,_core_Load__WEBPACK_IMPORTED_MODULE_14__.loadCSS)(theme_css_url)
        }


    }


    _loadLanguage(data) {
        try {
            var lang = this.options.language
            var script_path = this.options.script_path
            ;(0,_language_Language__WEBPACK_IMPORTED_MODULE_4__.loadLanguage)(lang, script_path).then((language) => {
                if (language) {
                    this.language = language
                    this.message.setLanguage(this.language)
                    this.showMessage(this._('loading_timeline'))
                } else {
                    this.showMessage(`Error loading ${lang}`) // but we will carry on using the fallback
                }
                this._initData(data)
            })
        } catch (e) {
            this.showMessage(this._translateError(e))
        }
    }

    /**
     * Initialize the data for this timeline. If data is a URL, pass it to ConfigFactory
     * to get a TimelineConfig; if data is a TimelineConfig, just use it; otherwise, 
     * assume it's a JSON object in the right format, and wrap it in a new TimelineConfig.
     * @param {string|TimelineConfig|object} data
     */
    _initData(data) {
        if (typeof data == 'string') {
            (0,_core_ConfigFactory__WEBPACK_IMPORTED_MODULE_7__.makeConfig)(data, {
                callback: function(config) {
                    this.setConfig(config);
                }.bind(this),
                sheets_proxy: this.options.sheets_proxy
            });
        } else if (_core_TimelineConfig__WEBPACK_IMPORTED_MODULE_8__.TimelineConfig == data.constructor) {
            this.setConfig(data);
        } else {
            this.setConfig(new _core_TimelineConfig__WEBPACK_IMPORTED_MODULE_8__.TimelineConfig(data));
        }
    }

    /**
     * Given an input, if it is a Timeline Error object, look up the
     * appropriate error in the current language and return it, optionally 
     * with detail that also comes in the object. Alternatively, pass back
     * the input, which is expected to be a string ready to display.
     * @param {Error|string} e - an Error object which can be localized, 
     *     or a string message
     */
    _translateError(e) {

        if (e.hasOwnProperty('stack')) {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.trace)(e.stack);
        }
        if (e.message_key) {
            return this._(e.message_key) + (e.detail ? ' [' + e.detail + ']' : '')
        }
        return e;

    }

    /**
     * Display a message in the Timeline window.
     * @param {string} msg 
     */
    showMessage(msg) {
            if (this.message) {
                this.message.updateMessage(msg);
            } else {
                (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.trace)("No message display available.")
                ;(0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.trace)(msg);
            }
        }
        /**
         * Not ideal, but if users don't specify the script path, we try to figure it out.
         * The script path is needed to load other languages
         */
    determineScriptPath() {
        let src = null;
        if (script_src_url) { // did we get it when this loaded?
            src = script_src_url;
        } else {
            let script_tag = document.getElementById('timeline-script-tag')
            if (script_tag) {
                src = script_tag.src
            }
        }

        if (!src) {
            let script_tags = document.getElementsByTagName('script');
            for (let index = script_tags.length - 1; index >= 0; index--) {
                if (script_tags[index].src) {
                    src = script_tags[index].src
                    break // if we haven't found anything else, use the latest loaded script
                }
            }
        }

        if (src) {
            // +1 to include the trailing slash or concatting for dynamic CSS load won't work.
            return src.substr(0, src.lastIndexOf('/') + 1);
        }
        return '';
    }


    setConfig(config) {
        this.config = config;
        if (this.config.isValid()) {
            // don't validate if it's already problematic to avoid clutter
            this.config.validate();
            this._validateOptions();
        }
        if (this.config.isValid()) {
            try {
                if (document.readyState === 'loading') { // Loading hasn't finished yet
                    document.addEventListener('DOMContentLoaded', this._onDataLoaded.bind(this));
                } else {
                    this._onDataLoaded();
                }
            } catch (e) {
                this.showMessage("<strong>" + this._('error') + ":</strong> " + this._translateError(e));
            }
        } else {
            var translated_errs = [];

            for (var i = 0, errs = this.config.getErrors(); i < errs.length; i++) {
                translated_errs.push(this._translateError(errs[i]));
            }

            this.showMessage("<strong>" + this._('error') + ":</strong> " + translated_errs.join('<br>'));
            // should we set 'self.ready'? if not, it won't resize,
            // but most resizing would only work
            // if more setup happens
        }
    }

    _onDataLoaded() {
        this.fire("dataloaded");
        this._initLayout();
        this._initEvents();
        this._initAnalytics();
        if (this.message) {
            this.message.hide();
        }
        let callback = (entries, observer) => {
            if (entries.reduce((accum, curr) => accum || curr.isIntersecting, false)) {
                this.updateDisplay()
            }
        }
        let observer = new IntersectionObserver(callback.bind(this))
        observer.observe(this._el.container)
        this.ready = true;
        this.fire("ready")

    }

    _initLayout() {

        this.message.removeFrom(this._el.container);
        this._el.container.innerHTML = "";

        // Create Layout
        if (this.options.timenav_position == "top") {
            this._el.timenav = _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.create('div', 'tl-timenav', this._el.container);
            this._el.menubar = _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.create('div', 'tl-menubar', this._el.container);
            this._el.storyslider = _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.create('div', 'tl-storyslider', this._el.container);
        } else {
            this._el.storyslider = _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.create('div', 'tl-storyslider', this._el.container);
            this._el.timenav = _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.create('div', 'tl-timenav', this._el.container);
            this._el.menubar = _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.create('div', 'tl-menubar', this._el.container);
        }

        // Knight Lab Logo
        this._el.attribution = _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.create('div', 'tl-attribution', this._el.container);
        this._el.attribution.innerHTML = "<a href='https://timeline.knightlab.com' target='_blank' rel='noopener'><span class='tl-knightlab-logo'></span>TimelineJS</a>"

        // Initial Default Layout
        this.options.width = this._el.container.offsetWidth;
        this.options.height = this._el.container.offsetHeight;
        // this._el.storyslider.style.top  = "1px";

        // Set TimeNav Height
        this.options.timenav_height = this._calculateTimeNavHeight(this.options.timenav_height);

        // Create TimeNav
        this._timenav = new _timenav_TimeNav__WEBPACK_IMPORTED_MODULE_9__.TimeNav(this._el.timenav, this.config, this.options, this.language);
        this._timenav.on('loaded', this._onTimeNavLoaded, this);
        this._timenav.options.height = this.options.timenav_height;
        this._timenav.init();

        // intial_zoom cannot be applied before the timenav has been created
        if (this.options.initial_zoom) {
            // at this point, this.options refers to the merged set of options
            this.setZoom(this.options.initial_zoom);
        }

        // Create StorySlider
        this._storyslider = new _slider_StorySlider__WEBPACK_IMPORTED_MODULE_12__.StorySlider(this._el.storyslider, this.config, this.options, this.language);
        this._el.storyslider.setAttribute('role', 'group');
        this._el.storyslider.setAttribute('aria-label', this._('aria_label_timeline_content'));
        this._storyslider.on('loaded', this._onStorySliderLoaded, this);
        this._storyslider.init();

        // Create Menu Bar
        this._menubar = new _ui_MenuBar__WEBPACK_IMPORTED_MODULE_13__.MenuBar(this._el.menubar, this._el.container, this.options, this.getLanguage());

        // LAYOUT
        if (this.options.layout == "portrait") {
            this.options.storyslider_height = (this.options.height - this.options.timenav_height - 1);
        } else {
            this.options.storyslider_height = (this.options.height - 1);
        }


        // Update Display
        // don't pass the height, since it gets computed 
        // and passing it leads to accidental duplicate adjustments
        this._updateDisplay() // this._timenav.options.height, true, 2000);

    }

    _initEvents() {
        // TimeNav Events
        this._timenav.on('change', this._onTimeNavChange, this);
        this._timenav.on('zoomtoggle', this._onZoomToggle, this);
        this._timenav.on('visible_ticks_change', this._onVisibleTicksChange, this);

        // StorySlider Events
        this._storyslider.on('change', this._onSlideChange, this);
        this._storyslider.on('colorchange', this._onColorChange, this);
        this._storyslider.on('nav_next', this._onStorySliderNext, this);
        this._storyslider.on('nav_previous', this._onStorySliderPrevious, this);

        // Menubar Events
        this._menubar.on('zoom_in', this._onZoomIn, this);
        this._menubar.on('zoom_out', this._onZoomOut, this);
        this._menubar.on('forward_to_end', this._onForwardToEnd, this);
        this._menubar.on('back_to_start', this._onBackToStart, this);

    }

    _onColorChange(e) {
        this.fire("color_change", { unique_id: this.current_id }, this);
    }

    _onSlideChange(e) {
        if (this.current_id != e.unique_id) {
            this.current_id = e.unique_id;
            this._timenav.goToId(this.current_id);
            this._onChange(e);
        }
    }

    _onTimeNavChange(e) {
        if (this.current_id != e.unique_id) {
            this.current_id = e.unique_id;
            this._storyslider.goToId(this.current_id);
            this._onChange(e);
        }
    }

    _onZoomToggle(e) {
        if (e.zoom == "in") {
            this._menubar.toogleZoomIn(e.show);
        } else if (e.zoom == "out") {
            this._menubar.toogleZoomOut(e.show);
        }

    }



    _onChange(e) {
        this.fire("change", { unique_id: this.current_id }, this);
        if (this.options.hash_bookmark && this.current_id) {
            this._updateHashBookmark(this.current_id);
        }
    }

    _onVisibleTicksChange(e) {
        this._menubar.changeVisibleTicks(e.visible_ticks);
    }

    _onForwardToEnd(e) {
        this.goToEnd();
        this.fire("forward_to_end", { unique_id: this.current_id }, this);
    }

    _onBackToStart(e) {
        this.goToStart();
        this.fire("back_to_start", { unique_id: this.current_id }, this);
    }

    _onZoomIn(e) {
        this._timenav.zoomIn();
        this.fire("zoom_in", { zoom_level: this._timenav.options.scale_factor }, this);
    }

    _onZoomOut(e) {
        this._timenav.zoomOut();
        this.fire("zoom_out", { zoom_level: this._timenav.options.scale_factor }, this);
    }

    _onTimeNavLoaded() {
        this._loaded.timenav = true;
        this._onLoaded();
    }

    _onStorySliderLoaded() {
        this._loaded.storyslider = true;
        this._onLoaded();
    }

    _onStorySliderNext(e) {
        this.fire("nav_next", e);
    }

    _onStorySliderPrevious(e) {
        this.fire("nav_previous", e);
    }


    _updateDisplay(timenav_height, animate, d) {
        var duration = this.options.duration,
            display_class = this.options.base_class,
            menu_position = 0,
            self = this;

        if (d) {
            duration = d;
        }

        // Update width and height
        this.options.width = this._el.container.offsetWidth;
        this.options.height = this._el.container.offsetHeight;

        // Check if skinny
        if (this.options.width <= this.options.skinny_size) {
            display_class += " tl-skinny";
            this.options.layout = "portrait";
        } else if (this.options.width <= this.options.medium_size) {
            display_class += " tl-medium";
            this.options.layout = "landscape";
        } else {
            this.options.layout = "landscape";
        }

        // Detect Mobile and Update Orientation on Touch devices
        if (_core_Browser__WEBPACK_IMPORTED_MODULE_10__.touch) {
            this.options.layout = _core_Browser__WEBPACK_IMPORTED_MODULE_10__.orientation();
        }

        if (_core_Browser__WEBPACK_IMPORTED_MODULE_10__.mobile) {
            display_class += " tl-mobile";
            // Set TimeNav Height
            this.options.timenav_height = this._calculateTimeNavHeight(timenav_height, this.options.timenav_mobile_height_percentage);
        } else {
            // Set TimeNav Height
            this.options.timenav_height = this._calculateTimeNavHeight(timenav_height);
        }

        // LAYOUT
        if (this.options.layout == "portrait") {
            // Portrait
            display_class += " tl-layout-portrait";

        } else {
            // Landscape
            display_class += " tl-layout-landscape";

        }

        // Set StorySlider Height
        this.options.storyslider_height = (this.options.height - this.options.timenav_height);

        // Positon Menu
        if (this.options.timenav_position == "top") {
            menu_position = (Math.ceil(this.options.timenav_height) / 2) - (this._el.menubar.offsetHeight / 2) - (39 / 2);
        } else {
            menu_position = Math.round(this.options.storyslider_height + 1 + (Math.ceil(this.options.timenav_height) / 2) - (this._el.menubar.offsetHeight / 2) - (35 / 2));
        }


        if (animate) {

            this._el.timenav.style.height = Math.ceil(this.options.timenav_height) + "px";

            // Animate StorySlider
            if (this.animator_storyslider) {
                this.animator_storyslider.stop();
            }
            this.animator_storyslider = (0,_animation_Animate__WEBPACK_IMPORTED_MODULE_11__.Animate)(this._el.storyslider, {
                height: this.options.storyslider_height + "px",
                duration: duration / 2,
                easing: _animation_Ease__WEBPACK_IMPORTED_MODULE_2__.easeOutStrong
            });

            // Animate Menubar
            if (this.animator_menubar) {
                this.animator_menubar.stop();
            }

            this.animator_menubar = (0,_animation_Animate__WEBPACK_IMPORTED_MODULE_11__.Animate)(this._el.menubar, {
                top: menu_position + "px",
                duration: duration / 2,
                easing: _animation_Ease__WEBPACK_IMPORTED_MODULE_2__.easeOutStrong
            });

        } else {
            // TimeNav
            this._el.timenav.style.height = Math.ceil(this.options.timenav_height) + "px";

            // StorySlider
            this._el.storyslider.style.height = this.options.storyslider_height + "px";

            // Menubar
            this._el.menubar.style.top = menu_position + "px";
        }

        if (this.message) {
            this.message.updateDisplay(this.options.width, this.options.height);
        }
        // Update Component Displays
        this._timenav.updateDisplay(this.options.width, this.options.timenav_height, animate);
        this._storyslider.updateDisplay(this.options.width, this.options.storyslider_height, animate, this.options.layout);

        if (this.language.direction == 'rtl') {
            display_class += ' tl-rtl';
        }


        // Apply class
        this._el.container.className = display_class;

    }

    /**
     * Compute the height of the navigation section of the Timeline, taking 
     *     into account the possibility of an explicit height or height 
     *     percentage, but also honoring the `timenav_height_min` option 
     *     value. If `timenav_height` is specified it takes precedence over 
     *     `timenav_height_percentage` but in either case, if the resultant 
     *     pixel height is less than `options.timenav_height_min` then the 
     *     value of `options.timenav_height_min` will be returned. (A minor 
     *     adjustment is made to the returned value to account for marker 
     *     padding.)
     * 
     * @param {number} [timenav_height] - an integer value for the desired height in pixels
     * @param {number} [timenav_height_percentage] - an integer between 1 and 100
     */
    _calculateTimeNavHeight(timenav_height, timenav_height_percentage) {

        var height = 0;

        if (false) {} else {
            if (this.options.timenav_height_percentage || timenav_height_percentage) {
                if (timenav_height_percentage) {
                    height = Math.round((this.options.height / 100) * timenav_height_percentage);
                } else {
                    height = Math.round((this.options.height / 100) * this.options.timenav_height_percentage);
                }

            }
        }

        // Set new minimum based on how many rows needed
        if (this._timenav.ready) {
            if (this.options.timenav_height_min < this._timenav.getMinimumHeight()) {
                this.options.timenav_height_min = this._timenav.getMinimumHeight();
            }
        }

        // If height is less than minimum set it to minimum
        if (height < this.options.timenav_height_min) {
            height = this.options.timenav_height_min;
        }

        height = height - (this.options.marker_padding * 2);

        return height;
    }

    _validateOptions() {
        // assumes that this.options and this.config have been set.
        var INTEGER_PROPERTIES = ['timenav_height', 'timenav_height_min', 'marker_height_min', 'marker_width_min', 'marker_padding', 'start_at_slide', 'slide_padding_lr'];

        for (var i = 0; i < INTEGER_PROPERTIES.length; i++) {
            var opt = INTEGER_PROPERTIES[i];
            var value = this.options[opt];
            let valid = true;
            if (typeof(value) == 'number') {
                valid = (value == parseInt(value))
            } else if (typeof(value) == "string") {
                valid = (value.match(/^\s*(\-?\d+)?\s*$/));
            }
            if (!valid) {
                this.config.logError({ message_key: 'invalid_integer_option', detail: opt });
            }
        }
    }

    /**
     * Given a slide identifier, return the zero-based positional index of
     * that slide. If this timeline has a 'title' slide, it is at position 0
     * and all other slides are numbered after that. If there is no 'title' 
     * slide, then the first event slide is at position 0.
     * @param {String} id 
     */
    _getSlideIndex(id) {
        if (this.config) {
            if (this.config.title && this.config.title.unique_id == id) {
                return 0;
            }
            for (var i = 0; i < this.config.events.length; i++) {
                if (id == this.config.events[i].unique_id) {
                    return this.config.title ? i + 1 : i;
                }
            }
        }
        return -1;
    }

    /**
     * Given a slide identifier, return the zero-based positional index of that slide.
     * Does not take the existence of a 'title' slide into account, so if there is a title
     * slide, this value should be one less than calling `_getSlideIndex` with the same
     * identifier. If there is no title slide, `_getSlideIndex` and `_getEventIndex` 
     * should return the same value.
     * TODO: does it really make sense to have both `_getSlideIndex` and `_getEventIndex`?
     * @param {String} id 
     */
    _getEventIndex(id) {
        for (var i = 0; i < this.config.events.length; i++) {
            if (id == this.config.events[i].unique_id) {
                return i;
            }
        }
        return -1;
    }

    _onLoaded() {
        if (this._loaded.storyslider && this._loaded.timenav) {
            this.fire("loaded", this.config);
            // Go to proper slide
            if ((0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.isTrue)(this.options.start_at_end) || this.options.start_at_slide > this.config.events.length) {
                this.goToEnd();
            } else {
                this.goTo(this.options.start_at_slide);
            }
            if (this.options.hash_bookmark) {
                if (window.location.hash != "") {
                    this.goToId(window.location.hash.replace("#event-", ""));
                } else {
                    this._updateHashBookmark(this.current_id);
                }
                let the_timeline = this;
                window.addEventListener('hashchange', function() {
                    if (window.location.hash.indexOf('#event-') == 0) {
                        the_timeline.goToId(window.location.hash.replace("#event-", ""));
                    }
                }, false);
            }

        }
    }

    // Update hashbookmark in the url bar
    _updateHashBookmark(id) {
        if (id) { // TODO: validate the id...
            var hash = "#" + "event-" + id.toString();
            window.history.replaceState(null, "Browsing TimelineJS", hash);
            this.fire("hash_updated", { unique_id: this.current_id, hashbookmark: "#" + "event-" + id.toString() }, this);
        }
    }


    /*
        PUBLIC API
        This has been minimally tested since most people use TimelineJS as an embed.
        If we hear from people who are trying to use TimelineJS this way, we will do
        what we can to make sure it works correctly, and will appreciate help!
    */
    zoomIn() {
        this._timenav.zoomIn();
    }

    zoomOut() {
        this._timenav.zoomOut();
    }

    setZoom(level) {
        this._timenav.setZoom(level);
    }

    // Goto slide with id
    goToId(id) {
        if (this.current_id != id) {

            this.current_id = id;
            this._timenav.goToId(this.current_id);
            this._storyslider.goToId(this.current_id, false, true);
            this.fire("change", { unique_id: this.current_id }, this);
        }
    }

    // Goto slide n
    goTo(n) {
        if (n < 0) {
            return;
        }

        try {
            if (this.config.title) {
                if (n === 0) {
                    this.goToId(this.config.title.unique_id);
                } else {
                    this.goToId(this.config.events[n - 1].unique_id);
                }
            } else {
                this.goToId(this.config.events[n].unique_id);
            }
        } catch {
            // because n is interpreted differently depending on 
            // whether there's a title slide, easier to use catch
            // to handle navigating beyond end instead of test before
            return
        }
    }

    // Goto first slide
    goToStart() {
        this.goTo(0);
    }

    // Goto last slide
    goToEnd() {
        var _n = this.config.events.length - 1;
        this.goTo(this.config.title ? _n + 1 : _n);
    }

    // Goto previous slide
    goToPrev() {
        this.goTo(this._getSlideIndex(this.current_id) - 1);
        this.focusContainer();
    }

    // Goto next slide
    goToNext() {
        this.goTo(this._getSlideIndex(this.current_id) + 1);
        this.focusContainer();
    }

    /* Event manipulation
    ================================================== */

    // Add an event
    add(data) {
        var unique_id = this.config.addEvent(data);

        var n = this._getEventIndex(unique_id);
        var d = this.config.events[n];

        this._storyslider.createSlide(d, this.config.title ? n + 1 : n);
        this._storyslider._updateDrawSlides();

        this._timenav.createMarker(d, n);
        this._timenav._updateDrawTimeline(false);

        this.fire("added", { unique_id: unique_id });
    }

    // Remove an event
    remove(n) {
        if (n >= 0 && n < this.config.events.length) {
            // If removing the current, nav to new one first
            if (this.config.events[n].unique_id == this.current_id) {
                if (n < this.config.events.length - 1) {
                    this.goTo(n + 1);
                } else {
                    this.goTo(n - 1);
                }
            }

            var event = this.config.events.splice(n, 1);
            delete this.config.event_dict[event[0].unique_id];
            this._storyslider.destroySlide(this.config.title ? n + 1 : n);
            this._storyslider._updateDrawSlides();

            this._timenav.destroyMarker(n);
            this._timenav._updateDrawTimeline(false);

            this.fire("removed", { unique_id: event[0].unique_id });
        }
    }

    removeId(id) {
        this.remove(this._getEventIndex(id));
    }

    /* Get slide data
    ================================================== */

    getData(n) {
        if (this.config.title) {
            if (n == 0) {
                return this.config.title;
            } else if (n > 0 && n <= this.config.events.length) {
                return this.config.events[n - 1];
            }
        } else if (n >= 0 && n < this.config.events.length) {
            return this.config.events[n];
        }
        return null;
    }

    getDataById(id) {
        return this.getData(this._getSlideIndex(id));
    }

    /* Get slide object
    ================================================== */

    getSlide(n) {
        if (n >= 0 && n < this._storyslider._slides.length) {
            return this._storyslider._slides[n];
        }
        return null;
    }

    getSlideById(id) {
        return this.getSlide(this._getSlideIndex(id));
    }

    getCurrentSlide() {
        return this.getSlideById(this.current_id);
    }

    updateDisplay() {
        if (this.ready) {
            this._updateDisplay();
        } else {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.trace)('updateDisplay called but timeline is not in ready state')
        }
    }

    focusContainer() {
        this._el.container.focus();
    }

    _initGoogleAnalytics(measurement_id) {
        (0,_core_Load__WEBPACK_IMPORTED_MODULE_14__.loadJS)(`https://www.googletagmanager.com/gtag/js?id=${measurement_id}`)
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', measurement_id);
    }

    _initAnalytics() {
        let measurement_id = this.options.ga_measurement_id || this.options.ga_property_id || null;
        if (!measurement_id) { return; }
        this._initGoogleAnalytics(measurement_id);
        var events = this.options.track_events;
        for (let i = 0; i < events.length; i++) {
            var event_ = events[i];
            this.addEventListener(event_, function(e) {
                gtag('event', e.type);
            });
        }
    }


}

(0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.classMixin)(Timeline, _language_I18NMixins__WEBPACK_IMPORTED_MODULE_5__.I18NMixins, _core_Events__WEBPACK_IMPORTED_MODULE_6__["default"])

async function exportJSON(url, proxy_url) {

    if (!proxy_url) {
        proxy_url = 'https://sheets-proxy.knightlab.com/proxy/'
    }

    let json = await (0,_core_ConfigFactory__WEBPACK_IMPORTED_MODULE_7__.jsonFromGoogleURL)(url, {sheets_proxy: proxy_url})
    return json
}




/***/ }),

/***/ "./src/js/timenav/AxisHelper.js":
/*!**************************************!*\
  !*** ./src/js/timenav/AxisHelper.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getBestHelper: () => (/* binding */ getBestHelper)
/* harmony export */ });
/* harmony import */ var _date_TLDate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../date/TLDate */ "./src/js/date/TLDate.js");
/* harmony import */ var _core_TLError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/TLError */ "./src/js/core/TLError.js");



/*  AxisHelper
    Strategies for laying out the timenav
    markers and time axis
    Intended as a private class -- probably only known to TimeScale
    Get them using the exported getBestHelper function
================================================== */
class AxisHelper {
    constructor(options) {
		if (options) {
            this.scale = options.scale;
	        this.minor = options.minor;
	        this.major = options.major;
		} else {
            throw new _core_TLError__WEBPACK_IMPORTED_MODULE_1__["default"]("axis_helper_no_options_err")
        }
       
    }
    
    getPixelsPerTick(pixels_per_milli) {
        return pixels_per_milli * this.minor.factor;
    }

    getMajorTicks(timescale) {
		return this._getTicks(timescale, this.major)
    }

    getMinorTicks(timescale) {
        return this._getTicks(timescale, this.minor)
    }

    _getTicks(timescale, option) {

        var factor_scale = timescale._scaled_padding * option.factor;
        var first_tick_time = timescale._earliest - factor_scale;
        var last_tick_time = timescale._latest + factor_scale;
        var ticks = []
        for (var i = first_tick_time; i < last_tick_time; i += option.factor) {
            ticks.push(timescale.getDateFromTime(i).floor(option.name));
        }

        return {
            name: option.name,
            ticks: ticks
        }

    }

}
var HELPERS = {};

var setHelpers = function(scale_type, scales) {
    HELPERS[scale_type] = [];
    
    for (var idx = 0; idx < scales.length - 1; idx++) {
        var minor = scales[idx];
        var major = scales[idx+1];
        HELPERS[scale_type].push(new AxisHelper({
            scale: minor[3],
            minor: { name: minor[0], factor: minor[1]},
            major: { name: major[0], factor: major[1]}
        }));
    }
};

setHelpers('human', _date_TLDate__WEBPACK_IMPORTED_MODULE_0__.SCALES);
setHelpers('cosmological', _date_TLDate__WEBPACK_IMPORTED_MODULE_0__.BIG_DATE_SCALES);


function getBestHelper(ts,optimal_tick_width) {
    if (typeof(optimal_tick_width) != 'number' ) {
        optimal_tick_width = 100;
    }
    var ts_scale = ts.getScale();
    var helpers = HELPERS[ts_scale];
    
    if (!helpers) {
        throw new _core_TLError__WEBPACK_IMPORTED_MODULE_1__["default"]("axis_helper_scale_err", ts_scale);
    }
    
    var prev = null;
    for (var idx = 0; idx < helpers.length; idx++) {
        var curr = helpers[idx];
        var pixels_per_tick = curr.getPixelsPerTick(ts._pixels_per_milli);
        if (pixels_per_tick > optimal_tick_width)  {
            if (prev == null) return curr;
            var curr_dist = Math.abs(optimal_tick_width - pixels_per_tick);
            var prev_dist = Math.abs(optimal_tick_width - pixels_per_tick);
            if (curr_dist < prev_dist) {
                return curr;
            } else {
                return prev;
            }
        }
        prev = curr;
    }
    return helpers[helpers.length - 1]; // last resort           
}


/***/ }),

/***/ "./src/js/timenav/TimeAxis.js":
/*!************************************!*\
  !*** ./src/js/timenav/TimeAxis.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimeAxis: () => (/* binding */ TimeAxis)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../dom/DOMMixins */ "./src/js/dom/DOMMixins.js");
/* harmony import */ var _language_I18NMixins__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../language/I18NMixins */ "./src/js/language/I18NMixins.js");
/* harmony import */ var _animation_Ease__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../animation/Ease */ "./src/js/animation/Ease.js");
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");







function isInHorizontalViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.left >= 0 &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

class TimeAxis {
    constructor(elem, options, language) {

        if (language) {
            this.setLanguage(language)
        }
        // DOM Elements
        this._el = {
            container: {},
            content_container: {},
            major: {},
            minor: {},
        };

        // Components
        this._text = {};

        // State
        this._state = {
            loaded: false
        };


        // Data
        this.data = {};

        // Options
        this.options = {
            duration: 1000,
            ease: _animation_Ease__WEBPACK_IMPORTED_MODULE_4__.easeInSpline,
            width: 600,
            height: 600
        };

        // Actively Displaying
        this.active = false;

        // Animation Object
        this.animator = {};

        // Axis Helper
        this.axis_helper = {};

        // Minor tick dom element array
        this.minor_ticks = [];

        // Minor tick dom element array
        this.major_ticks = [];

        // Main element
        if (typeof elem === 'object') {
            this._el.container = elem;
        } else {
            this._el.container = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.get(elem);
        }

        // Merge Data and Options
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)(this.options, options);

        this._initLayout();
        this._initEvents();

    }

    /*	Adding, Hiding, Showing etc
    ================================================== */
    show() {

    }

    hide() {

    }

    addTo(container) {
        container.appendChild(this._el.container);
    }

    removeFrom(container) {
        container.removeChild(this._el.container);
    }

    updateDisplay(w, h) {
        this._updateDisplay(w, h);
    }

    getLeft() {
        return this._el.container.style.left.slice(0, -2);
    }

    drawTicks(timescale, optimal_tick_width) {

        var ticks = timescale.getTicks();

        // FADE OUT
        this._el.major.className = "tl-timeaxis-major";
        this._el.minor.className = "tl-timeaxis-minor";
        this._el.major.style.opacity = 0;
        this._el.minor.style.opacity = 0;

        // CREATE MAJOR TICKS
        this.major_ticks = this._createTickElements(
            ticks['major'].ticks,
            this._el.major,
            timescale.getAxisTickDateFormat(ticks['major'].name)
        );

        // CREATE MINOR TICKS
        this.minor_ticks = this._createTickElements(
            ticks['minor'].ticks,
            this._el.minor,
            timescale.getAxisTickDateFormat(ticks['minor'].name),
            ticks['major'].ticks
        );

        this.positionTicks(timescale, optimal_tick_width, true);

        // FADE IN
        this._el.major.className = "tl-timeaxis-major tl-animate-opacity tl-timeaxis-animate-opacity";
        this._el.minor.className = "tl-timeaxis-minor tl-animate-opacity tl-timeaxis-animate-opacity";
        this._el.major.style.opacity = 1;
        this._el.minor.style.opacity = 1;
    }

    _createTickElements(ts_ticks, tick_element, dateformat, ticks_to_skip) {
        tick_element.innerHTML = "";
        var skip_times = {};

        var yearZero = new Date(-1, 13, -30);
        skip_times[yearZero.getTime()] = true;

        if (ticks_to_skip) {
            for (var i = 0; i < ticks_to_skip.length; i++) {
                skip_times[ticks_to_skip[i].getTime()] = true;
            }
        }

        var tick_elements = []
        for (var i = 0; i < ts_ticks.length; i++) {
            var ts_tick = ts_ticks[i];
            if (!(ts_tick.getTime() in skip_times)) {
                var tick = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-timeaxis-tick", tick_element),
                    tick_text = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("span", "tl-timeaxis-tick-text tl-animate-opacity", tick);

                let tick_display_date = ts_tick.getDisplayDate(this.getLanguage(), dateformat)
                tick_text.innerHTML = tick_display_date;

                tick_elements.push({
                    tick: tick,
                    tick_text: tick_text,
                    display_date: tick_display_date,
                    date: ts_tick
                });
            }
        }
        return tick_elements;
    }

    positionTicks(timescale, optimal_tick_width, no_animate) {

        // Handle Animation
        if (no_animate) {
            this._el.major.className = "tl-timeaxis-major";
            this._el.minor.className = "tl-timeaxis-minor";
        } else {
            this._el.major.className = "tl-timeaxis-major tl-timeaxis-animate";
            this._el.minor.className = "tl-timeaxis-minor tl-timeaxis-animate";
        }

        this._positionTickArray(this.major_ticks, timescale, optimal_tick_width);
        this._positionTickArray(this.minor_ticks, timescale, optimal_tick_width);

    }

    _positionTickArray(tick_array, timescale, optimal_tick_width) {
        // Poition Ticks & Handle density of ticks
        if (tick_array[1] && tick_array[0]) {
            var distance = (timescale.getPosition(tick_array[1].date.getMillisecond()) - timescale.getPosition(tick_array[0].date.getMillisecond())),
                fraction_of_array = 1;


            if (distance < optimal_tick_width) {
                fraction_of_array = Math.round(optimal_tick_width / timescale.getPixelsPerTick());
            }

            var show = 1;

            for (var i = 0; i < tick_array.length; i++) {

                var tick = tick_array[i];

                // Poition Ticks
                tick.tick.style.left = timescale.getPosition(tick.date.getMillisecond()) + "px";
                tick.tick_text.innerHTML = tick.display_date;

                // Handle density of ticks
                if (fraction_of_array > 1) {
                    if (show >= fraction_of_array) {
                        show = 1;
                        tick.tick_text.style.opacity = 1;
                        tick.tick.className = "tl-timeaxis-tick";
                    } else {
                        show++;
                        tick.tick_text.style.opacity = 0;
                        tick.tick.className = "tl-timeaxis-tick tl-timeaxis-tick-hidden";
                    }
                } else {
                    tick.tick_text.style.opacity = 1;
                    tick.tick.className = "tl-timeaxis-tick";
                }

            }
        }
    }

    getVisibleTicks() {
        return {
            major: this._getVisibleTickArray(this.major_ticks),
            minor: this._getVisibleTickArray(this.minor_ticks)
        }
    }

    _getVisibleTickArray(tick_array) {
        return tick_array.filter(({ tick }) => isInHorizontalViewport(tick))
    }

    /*	Events
    ================================================== */


    /*	Private Methods
    ================================================== */
    _initLayout() {
        this._el.content_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-timeaxis-content-container", this._el.container);
        this._el.major = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-timeaxis-major", this._el.content_container);
        this._el.minor = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-timeaxis-minor", this._el.content_container);

        // Fire event that the slide is loaded
        this.onLoaded();
    }

    _initEvents() {

    }

    // Update Display
    _updateDisplay(width, height, layout) {

        if (width) {
            this.options.width = width;
        }

        if (height) {
            this.options.height = height;
        }

    }

}

(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.classMixin)(TimeAxis, _core_Events__WEBPACK_IMPORTED_MODULE_1__["default"], _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_2__.DOMMixins, _language_I18NMixins__WEBPACK_IMPORTED_MODULE_3__.I18NMixins)

/***/ }),

/***/ "./src/js/timenav/TimeEra.js":
/*!***********************************!*\
  !*** ./src/js/timenav/TimeEra.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimeEra: () => (/* binding */ TimeEra)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../dom/DOMMixins */ "./src/js/dom/DOMMixins.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Browser */ "./src/js/core/Browser.js");
/* harmony import */ var _animation_Ease__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../animation/Ease */ "./src/js/animation/Ease.js");
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");







/**
 * A TimeEra represents a span of time marked along the edge of the time 
 * slider. It must have a 
 */
class TimeEra {
    constructor(start_date, end_date, headline, options) {


        this.start_date = start_date
        this.end_date = end_date
        this.headline = headline

        // DOM Elements
        this._el = {
            container: {},
            background: {},
            content_container: {},
            content: {},
            text: {}
        };

        // Components
        this._text = {};

        // State
        this._state = {
            loaded: false
        };

        // Options
        this.options = {
            duration: 1000,
            ease: _animation_Ease__WEBPACK_IMPORTED_MODULE_4__.easeInSpline,
            width: 600,
            height: 600,
            marker_width_min: 100
        };

        // Actively Displaying
        this.active = false;

        // Animation Object
        this.animator = {};

        // End date
        this.has_end_date = false;

        // Merge Data and Options
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)(this.options, options);

        this._initLayout();
        this._initEvents();


    }

    /*	Adding, Hiding, Showing etc
    ================================================== */
    show() {

    }

    hide() {

    }

    setActive(is_active) {

    }

    addTo(container) {
        container.appendChild(this._el.container);
    }

    removeFrom(container) {
        container.removeChild(this._el.container);
    }

    updateDisplay(w, h) {
        this._updateDisplay(w, h);
    }

    getLeft() {
        return this._el.container.style.left.slice(0, -2);
    }

    getTime() {
        return this.start_date.getTime();
    }

    getEndTime() {

        if (this.end_date) {
            return this.end_date.getTime();
        } else {
            return false;
        }
    }

    setHeight(h) {
        var text_line_height = 12,
            text_lines = 1;

        this._el.content_container.style.height = h + "px";
        this._el.content.className = "tl-timeera-content";

        // Handle number of lines visible vertically

        if (_core_Browser__WEBPACK_IMPORTED_MODULE_3__.webkit) {
            text_lines = Math.floor(h / (text_line_height + 2));
            if (text_lines < 1) {
                text_lines = 1;
            }
            this._text.className = "tl-headline";
            this._text.style.webkitLineClamp = text_lines;
        } else {
            text_lines = h / text_line_height;
            if (text_lines > 1) {
                this._text.className = "tl-headline tl-headline-fadeout";
            } else {
                this._text.className = "tl-headline";
            }
            this._text.style.height = (text_lines * text_line_height) + "px";
        }

    }

    setWidth(w) {
        if (this.end_date) {
            this._el.container.style.width = w + "px";

            if (w > this.options.marker_width_min) {
                this._el.content_container.style.width = w + "px";
                this._el.content_container.className = "tl-timeera-content-container tl-timeera-content-container-long";
            } else {
                this._el.content_container.style.width = this.options.marker_width_min + "px";
                this._el.content_container.className = "tl-timeera-content-container";
            }
        }

    }

    setClass(n) {
        this._el.container.className = n;
    }

    setRowPosition(n, remainder) {
        this.setPosition({ top: n });

        if (remainder < 56) {
            this._el.content_container.remove("tl-timeera-content-container-small");
        }
    }

    setColor(color_num) {
        this._el.container.className = 'tl-timeera tl-timeera-color' + color_num;
    }

    /*	Events
    ================================================== */


    /*	Private Methods
    ================================================== */
    _initLayout() {
        // Create Layout
        this._el.container = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-timeera");

        if (this.end_date) {
            this.has_end_date = true;
            this._el.container.className = 'tl-timeera tl-timeera-with-end';
        }

        this._el.content_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-timeera-content-container", this._el.container);

        this._el.background = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-timeera-background", this._el.content_container);

        this._el.content = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-timeera-content", this._el.content_container);



        // Text
        this._el.text = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("div", "tl-timeera-text", this._el.content);
        this._text = _dom_DOM__WEBPACK_IMPORTED_MODULE_5__.create("h2", "tl-headline", this._el.text);
        if (this.headline && this.headline != "") {
            this._text.innerHTML = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.unlinkify)(this.headline);
        }



        // Fire event that the slide is loaded
        this.onLoaded();

    }

    _initEvents() {

    }

    // Update Display
    _updateDisplay(width, height, layout) {

        if (width) {
            this.options.width = width;
        }

        if (height) {
            this.options.height = height;
        }

    }

}

(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.classMixin)(TimeEra, _core_Events__WEBPACK_IMPORTED_MODULE_1__["default"], _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_2__.DOMMixins)

/***/ }),

/***/ "./src/js/timenav/TimeGroup.js":
/*!*************************************!*\
  !*** ./src/js/timenav/TimeGroup.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimeGroup: () => (/* binding */ TimeGroup)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../dom/DOMMixins */ "./src/js/dom/DOMMixins.js");
/* harmony import */ var _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../dom/DOMEvent */ "./src/js/dom/DOMEvent.js");
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");






class TimeGroup {
	constructor(data) {
		
		// DOM ELEMENTS
		this._el = {
			parent: {},
			container: {},
			message: {}
		};
		
		//Options
		this.options = {
			width: 					600,
			height: 				600
		};
		
		// Data
		this.data = {
			label: "",
			rows: 1
		};
		
		
		this._el.container = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("div", "tl-timegroup"); 
		
		// Merge Data
		(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)(this.data, data);
		
		// Animation
		this.animator = {};
		
		
		this._initLayout();
		this._initEvents();
	}
	
	/*	Public
	================================================== */
	
	
	
	/*	Update Display
	================================================== */
	updateDisplay(w, h) {
		
	}
	
	setRowPosition(n, h) {
    this.options.height = h * this.data.rows;
    this.setPosition({top:n});
    this._el.container.style.height = this.options.height + "px";
    
    // ADD LEVEL AWARENESS - groups need to span the full width of all levels
    var totalLevels = 6; // You'll need to get this from somewhere, maybe pass it as parameter
    var levelSpacing = 120;
    this._el.container.style.width = (totalLevels * levelSpacing) + "px";
    this._el.container.style.left = "0px"; // Ensure groups start at left edge
}
	
	setAlternateRowColor(alternate, hide) {
		var class_name = "tl-timegroup";
		if (alternate) {
			class_name += " tl-timegroup-alternate";
		}
		if (hide) {
			class_name += " tl-timegroup-hidden";
		}
		this._el.container.className = class_name;
	}
	
	/*	Events
	================================================== */

	
	_onMouseClick() {
		this.fire("clicked", this.options);
	}

	
	/*	Private Methods
	================================================== */
	_initLayout () {
		
		// Create Layout
		this._el.message = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("div", "tl-timegroup-message", this._el.container);
		this._el.message.innerHTML = this.data.label;
		
		
	}
	
	_initEvents () {
		_dom_DOMEvent__WEBPACK_IMPORTED_MODULE_3__.DOMEvent.addListener(this._el.container, 'click', this._onMouseClick, this);
	}
	
	// Update Display
	_updateDisplay(width, height, animate) {
		
	}
	
}

(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.classMixin)(TimeGroup, _core_Events__WEBPACK_IMPORTED_MODULE_1__["default"], _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_2__.DOMMixins)


/***/ }),

/***/ "./src/js/timenav/TimeMarker.js":
/*!**************************************!*\
  !*** ./src/js/timenav/TimeMarker.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimeMarker: () => (/* binding */ TimeMarker)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../dom/DOMMixins */ "./src/js/dom/DOMMixins.js");
/* harmony import */ var _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../dom/DOMEvent */ "./src/js/dom/DOMEvent.js");
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Browser */ "./src/js/core/Browser.js");
/* harmony import */ var _animation_Ease__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../animation/Ease */ "./src/js/animation/Ease.js");
/* harmony import */ var _media_MediaType__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../media/MediaType */ "./src/js/media/MediaType.js");
/* harmony import */ var _language_I18NMixins__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../language/I18NMixins */ "./src/js/language/I18NMixins.js");












class TimeMarker {
	constructor(data, options) {

		// DOM Elements
		this._el = {
			container: {},
			content_container: {},
			media_container: {},
			timespan: {},
			line_left: {},
			line_right: {},
			content: {},
			text: {},
			media: {},
		};

		// Components
		this._text = {};

		// State
		this._state = {
			loaded: false
		};


		// Data
		this.data = {
			unique_id: "",
			background: null,
			date: {
				year: 0,
				month: 0,
				day: 0,
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0,
				thumbnail: "",
				format: ""
			},
			text: {
				headline: "",
				text: ""
			},
			media: null
		};

		// Options
		this.options = {
			duration: 1000,
			ease: _animation_Ease__WEBPACK_IMPORTED_MODULE_6__.easeInSpline,
			width: 600,
			height: 600,
			marker_width_min: 100 			// Minimum Marker Width
		};

		// Actively Displaying
		this.active = false;

		// Animation Object
		this.animator = {};

		// End date
		this.has_end_date = false;

        // Alternative text
        this.ariaLabel = '';

		// Merge Data and Options
		(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)(this.options, options);
		(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)(this.data, data);

		this._initLayout();
		this._initEvents();


	}

	/*	Adding, Hiding, Showing etc
	================================================== */
	show() {

	}

	hide() {

	}

	setActive(is_active) {
		this.active = is_active;

		if (this.active && this.has_end_date) {
			this._el.container.className = 'tl-timemarker tl-timemarker-with-end tl-timemarker-active';
		} else if (this.active) {
			this._el.container.className = 'tl-timemarker tl-timemarker-active';
		} else if (this.has_end_date) {
			this._el.container.className = 'tl-timemarker tl-timemarker-with-end';
		} else {
			this._el.container.className = 'tl-timemarker';
		}

        this._el.container.ariaLabel = this.ariaLabel;
        if (this.active) {
            this._el.container.ariaLabel += ', shown';
        } else {
            this._el.container.ariaLabel += ', press space to show';
        }
	}

    setFocus(options = { preventScroll: true }) {
        this._el.container.focus(options);
    }

	addTo(container) {
		container.appendChild(this._el.container);
	}

	removeFrom(container) {
		container.removeChild(this._el.container);
	}

	updateDisplay(w, h) {
		this._updateDisplay(w, h);
	}

	loadMedia() {

		if (this._media && !this._state.loaded) {
			this._media.loadMedia();
			this._state.loaded = true;
		}
	}

	stopMedia() {
		if (this._media && this._state.loaded) {
			this._media.stopMedia();
		}
	}

	getLeft() {
		return this._el.container.style.left.slice(0, -2);
	}

	getTime() {
		return this.data.start_date.getTime();
	}

	getEndTime() {

		if (this.data.end_date) {
			return this.data.end_date.getTime();
		} else {
			return false;
		}
	}

	setHeight(h) {
		var text_line_height = 12,
			text_lines = 1;

		this._el.content_container.style.height = h + "px";
		this._el.timespan_content.style.height = h + "px";
		// Handle Line height for better display of text
		if (h <= 30) {
			this._el.content.className = "tl-timemarker-content tl-timemarker-content-small";
		} else {
			this._el.content.className = "tl-timemarker-content";
		}

		if (h <= 56) {
			this._el.content_container.classList.add("tl-timemarker-content-container-small");
		} else {
			this._el.content_container.classList.remove("tl-timemarker-content-container-small");
		}

		// Handle number of lines visible vertically

		if (_core_Browser__WEBPACK_IMPORTED_MODULE_5__.webkit) {
			text_lines = Math.floor(h / (text_line_height + 2));
			if (text_lines < 1) {
				text_lines = 1;
			}
			this._text.className = "tl-headline";
			this._text.style.webkitLineClamp = text_lines;
		} else {
			text_lines = h / text_line_height;
			if (text_lines > 1) {
				this._text.className = "tl-headline tl-headline-fadeout";
			} else {
				this._text.className = "tl-headline";
			}
			this._text.style.height = (text_lines * text_line_height) + "px";
		}

	}

	setWidth(w) {
		if (this.data.end_date) {
			this._el.container.style.width = w + "px";

			if (w > this.options.marker_width_min) {
				this._el.content_container.style.width = w + "px";
				this._el.content_container.className = "tl-timemarker-content-container tl-timemarker-content-container-long";
			} else {
				this._el.content_container.style.width = this.options.marker_width_min + "px";
				this._el.content_container.className = "tl-timemarker-content-container";
			}
		}

	}

	setClass(n) {
		this._el.container.className = n;
	}

	setRowPosition(n, remainder) {
    // Get the level from the data if it exists
    var level = this.data.level || 0;
    
    // Calculate horizontal offset based on level
    var levelSpacing = 120; // Adjust this value as needed
    var levelOffset = level * levelSpacing;
    
    // Set both vertical (row) and horizontal (level) positioning
    this.setPosition({ 
        top: n,
        left: levelOffset 
    });
    
    this._el.timespan.style.height = remainder + "px";
    
    // Add a CSS class for level-based styling
    this._el.container.setAttribute('data-level', level);
}

    getFormattedDate() {
        if ((0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trim)(this.data.display_date).length > 0) {
            return this.data.display_date;
        }

        let date_text = "";
        if (this.data.end_date) {
            date_text = " to " + this.data.end_date.getDisplayDate(this.getLanguage());
        }
        if (this.data.start_date) {
            date_text = (date_text ? "from " : "") + this.data.start_date.getDisplayDate(this.getLanguage()) + date_text;
        }
        return date_text;
    }

	/*	Events
	================================================== */
	_onMarkerClick(e) {
		this.fire("markerclick", { unique_id: this.data.unique_id });
	}

    _onMarkerKeydown(e) {
        if (/Space|Enter/.test(e.code)) {
            this.fire("markerclick", { unique_id: this.data.unique_id });
        }
    }

    _onMarkerBlur(e) {
        this.fire("markerblur", { unique_id: this.data.unique_id });
    }

	/*	Private Methods
	================================================== */
	_initLayout() {
		// Create Layout
		this._el.container = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("div", "tl-timemarker");
        this._el.container.setAttribute('tabindex', '-1');

		if (this.data.unique_id) {
			this._el.container.id = this.data.unique_id + "-marker";
		}

		if (this.data.end_date) {
			this.has_end_date = true;
			this._el.container.className = 'tl-timemarker tl-timemarker-with-end';
		}

		this._el.timespan = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("div", "tl-timemarker-timespan", this._el.container);
		this._el.timespan_content = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("div", "tl-timemarker-timespan-content", this._el.timespan);
		this._el.content_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("div", "tl-timemarker-content-container", this._el.container);

		this._el.content = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("div", "tl-timemarker-content", this._el.content_container);

		this._el.line_left = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("div", "tl-timemarker-line-left", this._el.timespan);
		this._el.line_right = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("div", "tl-timemarker-line-right", this._el.timespan);

		// Thumbnail or Icon
		if (this.data.media) {
			this._el.media_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("div", "tl-timemarker-media-container", this._el.content);
			// ugh. needs an overhaul
			var mtd = { url: this.data.media.thumbnail };
			var thumbnail_media_type = (this.data.media.thumbnail) ? (0,_media_MediaType__WEBPACK_IMPORTED_MODULE_7__.lookupMediaType)(mtd, true) : null;
			if (thumbnail_media_type) {
				var thumbnail_media = new thumbnail_media_type.cls(mtd);
				thumbnail_media.on("loaded", function () {
					this._el.media = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("img", "tl-timemarker-media", this._el.media_container);
					this._el.media.src = thumbnail_media.getImageURL();
				}.bind(this));
				thumbnail_media.loadMedia();
			} else {
				var media_type = (0,_media_MediaType__WEBPACK_IMPORTED_MODULE_7__.lookupMediaType)(this.data.media).type;
				this._el.media = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("span", "tl-icon-" + media_type, this._el.media_container);
			}

		}


		// Text
		this._el.text = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("div", "tl-timemarker-text", this._el.content);
		this._text = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create("h2", "tl-headline", this._el.text);
		if (this.data.text.headline && this.data.text.headline != "") {
			this._text.innerHTML = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.unlinkify)(this.data.text.headline);
		} else if (this.data.text.text && this.data.text.text != "") {
			this._text.innerHTML = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.unlinkify)(this.data.text.text);
		} else if (this.data.media && this.data.media.caption && this.data.media.caption != "") {
			this._text.innerHTML = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.unlinkify)(this.data.media.caption);
		}

        const date = this.getFormattedDate();
        this.ariaLabel = `${this._text.innerHTML}, ${date}`;

		// Fire event that the slide is loaded
		this.onLoaded();

	}

	_initEvents() {
		_dom_DOMEvent__WEBPACK_IMPORTED_MODULE_3__.DOMEvent.addListener(this._el.container, 'click', this._onMarkerClick, this);
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_3__.DOMEvent.addListener(this._el.container, 'keydown', this._onMarkerKeydown, this);
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_3__.DOMEvent.addListener(this._el.container, 'blur', this._onMarkerBlur, this);
	}

	// Update Display
	_updateDisplay(width, height, layout) {

		if (width) {
			this.options.width = width;
		}

		if (height) {
			this.options.height = height;
		}

	}

}


(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.classMixin)(TimeMarker, _language_I18NMixins__WEBPACK_IMPORTED_MODULE_8__.I18NMixins, _core_Events__WEBPACK_IMPORTED_MODULE_1__["default"], _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_2__.DOMMixins)


/***/ }),

/***/ "./src/js/timenav/TimeNav.js":
/*!***********************************!*\
  !*** ./src/js/timenav/TimeNav.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimeNav: () => (/* binding */ TimeNav)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../dom/DOMMixins */ "./src/js/dom/DOMMixins.js");
/* harmony import */ var _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../dom/DOMEvent */ "./src/js/dom/DOMEvent.js");
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");
/* harmony import */ var _animation_Ease__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../animation/Ease */ "./src/js/animation/Ease.js");
/* harmony import */ var _TimeScale__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./TimeScale */ "./src/js/timenav/TimeScale.js");
/* harmony import */ var _TimeGroup__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./TimeGroup */ "./src/js/timenav/TimeGroup.js");
/* harmony import */ var _TimeEra__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./TimeEra */ "./src/js/timenav/TimeEra.js");
/* harmony import */ var _TimeAxis__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./TimeAxis */ "./src/js/timenav/TimeAxis.js");
/* harmony import */ var _TimeMarker__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./TimeMarker */ "./src/js/timenav/TimeMarker.js");
/* harmony import */ var _ui_Swipable__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../ui/Swipable */ "./src/js/ui/Swipable.js");
/* harmony import */ var _animation_Animate__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../animation/Animate */ "./src/js/animation/Animate.js");
/* harmony import */ var _language_I18NMixins__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../language/I18NMixins */ "./src/js/language/I18NMixins.js");

















class TimeNav {

    constructor(elem, timeline_config, options, language) {
        this.language = language
            // DOM ELEMENTS
        this._el = {
            parent: {},
            container: {},
            slider: {},
            slider_background: {},
            line: {},
            marker_container_mask: {},
            marker_container: {},
            marker_item_container: {},
            timeaxis: {},
            timeaxis_background: {}
        };

        this.collapsed = false;

        if (typeof elem === 'object') {
            this._el.container = elem;
        } else {
            this._el.container = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.get(elem);
        }
        this._el.container.setAttribute('tabindex', '0');

        // 'application' role supports predictable control of keyboard input in a complex component
        this._el.container.setAttribute('role', 'application');
        this._el.container.setAttribute('aria-label', this._('aria_label_timeline_navigation'));
        this._el.container.setAttribute('aria-description',
            'Navigate between markers with arrow keys. Press "Home" for the first and "End" for the last markers'
        );

        this.config = timeline_config;

        //Options
        this.options = {
            width: 600,
            height: 600,
            duration: 1000,
            ease: _animation_Ease__WEBPACK_IMPORTED_MODULE_5__.easeInOutQuint,
            has_groups: false,
            optimal_tick_width: 50,
            scale_factor: 2, // How many screen widths wide should the timeline be
            marker_padding: 5,
            timenav_height_min: 150, // Minimum timenav height
            marker_height_min: 30, // Minimum Marker Height
            marker_width_min: 100, // Minimum Marker Width
            zoom_sequence: [0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89] // Array of Fibonacci numbers for TimeNav zoom levels http://www.maths.surrey.ac.uk/hosted-sites/R.Knott/Fibonacci/fibtable.html
        };

        // Animation
        this.animator = null;

        // Ready state
        this.ready = false;

        // Markers Array
        this._markers = [];

        // Eras Array
        this._eras = [];
        this.has_eras = false;

        /**
         * @type TimeGroup
         */
        this._groups = [];

        // Row Height
        this._calculated_row_height = 100;

        // Current Marker
        this.current_id = "";

        // Current Focused Marker
        this.current_focused_id = "";

        // TimeScale
        this.timescale = {};

        // TimeAxis
        this.timeaxis = {};

        // Max Rows
        this.max_rows = 6;

        // Animate CSS
        this.animate_css = false;

        // Swipe Object
        this._swipable;

        // Merge Data and Options
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)(this.options, options);

    }

    init() {
        this._initLayout();
        this._initEvents();
        this._initData();
        this.updateDisplay();

        this._onLoaded();
    }

    /*	Public
    ================================================== */
    positionMarkers(fast) {
        // POSITION X
        for (var i = 0; i < this._markers.length; i++) {
            var pos = this.timescale.getPositionInfo(i);
            if (fast) {
                this._markers[i].setClass("tl-timemarker tl-timemarker-fast");
            } else {
                this._markers[i].setClass("tl-timemarker");
            }
            this._markers[i].setPosition({ left: pos.start });
            this._markers[i].setWidth(pos.width);
        };
    }

    /*	Update Display
    ================================================== */
    updateDisplay(width, height, animate) {
        let reposition_markers = false;
        if (width) {
            if (this.options.width == 0 && width > 0) {
                reposition_markers = true;
            }
            this.options.width = width;
        }
        if (height && height != this.options.height) {
            this.options.height = height;
            this.timescale = this._getTimeScale();
        }

        // Size Markers
        this._assignRowsToMarkers();

        // Size swipable area
        this._el.slider_background.style.width = this.timescale.getPixelWidth() + this.options.width + "px";
        this._el.slider_background.style.left = -(this.options.width / 2) + "px";
        this._el.slider.style.width = this.timescale.getPixelWidth() + this.options.width + "px";

        // Update Swipable constraint
        this._swipable.updateConstraint({ top: false, bottom: false, left: (this.options.width / 2), right: -(this.timescale.getPixelWidth() - (this.options.width / 2)) });

        if (reposition_markers) {
            this._drawTimeline()
        }
        // Go to the current slide
        this.goToId(this.current_id, true);
    }


    /*	TimeScale
    ================================================== */
    _getTimeScale() {
        /* maybe the establishing config values (marker_height_min and max_rows) should be
        separated from making a TimeScale object, which happens in another spot in this file with duplicate mapping of properties of this TimeNav into the TimeScale options object? */
        // Set Max Rows
        var marker_height_min = 0;
        try {
            marker_height_min = parseInt(this.options.marker_height_min);
        } catch (e) {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)("Invalid value for marker_height_min option.");
            marker_height_min = 30;
        }
        if (marker_height_min == 0) {
            (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.trace)("marker_height_min option must not be zero.")
            marker_height_min = 30;
        }
        this.max_rows = Math.round((this.options.height - this._el.timeaxis_background.offsetHeight - (this.options.marker_padding)) / marker_height_min);
        if (this.max_rows < 1) {
            this.max_rows = 1;
        }
        return new _TimeScale__WEBPACK_IMPORTED_MODULE_6__.TimeScale(this.config, {
            display_width: this._el.container.offsetWidth,
            screen_multiplier: this.options.scale_factor,
            max_rows: this.max_rows

        });
    }

    _updateTimeScale(new_scale) {
        this.options.scale_factor = new_scale;
        this._updateDrawTimeline();
    }

    zoomIn() { // move the the next "higher" scale factor
        var new_scale = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.findNextGreater)(this.options.zoom_sequence, this.options.scale_factor);
        this.setZoomFactor(new_scale);
    }

    zoomOut() { // move the the next "lower" scale factor
        var new_scale = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.findNextLesser)(this.options.zoom_sequence, this.options.scale_factor);
        this.setZoomFactor(new_scale);
    }

    setZoom(level) {
        var zoom_factor = this.options.zoom_sequence[level];
        if (typeof(zoom_factor) == 'number') {
            this.setZoomFactor(zoom_factor);
        } else {
            console.warn("Invalid zoom level. Please use an index number between 0 and " + (this.options.zoom_sequence.length - 1));
        }
    }

    setZoomFactor(factor) {
        if (factor <= this.options.zoom_sequence[0]) {
            this.fire("zoomtoggle", { zoom: "out", show: false });
        } else {
            this.fire("zoomtoggle", { zoom: "out", show: true });
        }

        if (factor >= this.options.zoom_sequence[this.options.zoom_sequence.length - 1]) {
            this.fire("zoomtoggle", { zoom: "in", show: false });
        } else {
            this.fire("zoomtoggle", { zoom: "in", show: true });
        }

        if (factor == 0) {
            console.warn("Zoom factor must be greater than zero. Using 0.1");
            factor = 0.1;
        }
        this.options.scale_factor = factor;
        //this._updateDrawTimeline(true);
        this.goToId(this.current_id, !this._updateDrawTimeline(true), true);
    }

    /*	Groups
    ================================================== */
    _createGroups() {
        this._groups = [];
        var group_labels = this.timescale.getGroupLabels();

        if (group_labels) {
            this.options.has_groups = true;
            for (var i = 0; i < group_labels.length; i++) {
                this._createGroup(group_labels[i]);
            }
        }

    }

    _createGroup(group_label) {
        var group = new _TimeGroup__WEBPACK_IMPORTED_MODULE_7__.TimeGroup(group_label);
        this._addGroup(group);
        this._groups.push(group);
    }

    _addGroup(group) {
        group.addTo(this._el.container);

    }

    _positionGroups() {
        if (this.options.has_groups) {
            var available_height = (this.options.height - this._el.timeaxis_background.offsetHeight),
                group_height = Math.floor((available_height / this.timescale.getNumberOfRows()) - this.options.marker_padding),
                group_labels = this.timescale.getGroupLabels();

            for (var i = 0, group_rows = 0; i < this._groups.length; i++) {
                var group_y = Math.floor(group_rows * (group_height + this.options.marker_padding));
                var group_hide = false;
                if (group_y > (available_height - this.options.marker_padding)) {
                    group_hide = true;
                }

                this._groups[i].setRowPosition(group_y, this._calculated_row_height + this.options.marker_padding / 2);
                this._groups[i].setAlternateRowColor((0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.isEven)(i), group_hide);

                group_rows += this._groups[i].data.rows; // account for groups spanning multiple rows
            }
        }
    }

    /*	Markers
    ================================================== */
    _addMarker(marker) {
        marker.addTo(this._el.marker_item_container);
        marker.on('markerclick', this._onMarkerClick, this);
        marker.on('added', this._onMarkerAdded, this);
    }

    _createMarker(data, n) {
        var marker = new _TimeMarker__WEBPACK_IMPORTED_MODULE_10__.TimeMarker(data, this.options);
        this._addMarker(marker);
        if (n < 0) {
            this._markers.push(marker);
        } else {
            this._markers.splice(n, 0, marker);
        }
    }

    _createMarkers(array) {
        for (var i = 0; i < array.length; i++) {
            this._createMarker(array[i], -1);
        }
    }

    _removeMarker(marker) {
        marker.removeFrom(this._el.marker_item_container);
        //marker.off('added', this._onMarkerRemoved, this);
    }

    _destroyMarker(n) {
        this._removeMarker(this._markers[n]);
        this._markers.splice(n, 1);
    }

    _calculateMarkerHeight(h) {
        return ((h / this.timescale.getNumberOfRows()) - this.options.marker_padding);
    }

    _calculateRowHeight(h) {
        return (h / this.timescale.getNumberOfRows());
    }

    _calculateAvailableHeight() {
        return (this.options.height - this._el.timeaxis_background.offsetHeight - (this.options.marker_padding));
    }

    _calculateMinimumTimeNavHeight() {
        return (this.timescale.getNumberOfRows() * this.options.marker_height_min) + this._el.timeaxis_background.offsetHeight + (this.options.marker_padding);

    }

    getMinimumHeight() {
        return this._calculateMinimumTimeNavHeight();
    }

    _assignRowsToMarkers() {
    var available_height = this._calculateAvailableHeight(),
        marker_height = this._calculateMarkerHeight(available_height);

    this._positionGroups();

    this._calculated_row_height = this._calculateRowHeight(available_height);

    for (var i = 0; i < this._markers.length; i++) {
        // Set Height
        this._markers[i].setHeight(marker_height);

        //Position by Row AND Level
        var pos_info = this.timescale.getPositionInfo(i);
        var row = pos_info.row;
        var level = pos_info.level || 0; // GET THE LEVEL FROM TIMESCALE

        var marker_y = Math.floor(row * (marker_height + this.options.marker_padding)) + this.options.marker_padding;
        var remainder_height = available_height - marker_y + this.options.marker_padding;
        
        // PASS LEVEL INFORMATION TO THE MARKER
        this._markers[i].data.level = level; // Store level in marker data
        this._markers[i].setRowPosition(marker_y, remainder_height);
    };
}

    _resetMarkersActive() {
        for (var i = 0; i < this._markers.length; i++) {
            this._markers[i].setActive(false);
        }
    }

    _resetMarkersBlurListeners() {
        for (var i = 0; i < this._markers.length; i++) {
            this._markers[i].off('markerblur', this._onMarkerBlur, this);
        }
    }

    _findMarkerIndex(n) {
        var _n = -1;
        if (typeof n == 'string' || n instanceof String) {
            _n = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.findArrayNumberByUniqueID)(n, this._markers, "unique_id", _n);
        }
        return _n;
    }

    /*	ERAS
    ================================================== */
    _createEras(array) {
        for (var i = 0; i < array.length; i++) {
            var data = array[i];
            var era = new _TimeEra__WEBPACK_IMPORTED_MODULE_8__.TimeEra(data.start_date,
                data.end_date,
                data.headline,
                this.options);
            this._eras.push(era);
            era.addTo(this._el.marker_item_container);
            era.on('added', this._onEraAdded, this);
        }
    }

    _positionEras(fast) {

        var era_color = 0;
        // POSITION X
        for (var i = 0; i < this._eras.length; i++) {
            var pos = {
                start: 0,
                end: 0,
                width: 0
            };

            pos.start = this.timescale.getPosition(this._eras[i].start_date.getTime());
            pos.end = this.timescale.getPosition(this._eras[i].end_date.getTime());
            pos.width = pos.end - pos.start;

            if (fast) {
                this._eras[i].setClass("tl-timeera tl-timeera-fast");
            } else {
                this._eras[i].setClass("tl-timeera");
            }
            this._eras[i].setPosition({ left: pos.start });
            this._eras[i].setWidth(pos.width);

            era_color++;
            if (era_color > 5) {
                era_color = 0;
            }
            this._eras[i].setColor(era_color);
        };

    }

    /*	Public
    ================================================== */

    // Create a marker
    createMarker(d, n) {
        this._createMarker(d, n);
    }

    // Create many markers from an array
    createMarkers(array) {
        this._createMarkers(array);
    }

    // Destroy marker by index
    destroyMarker(n) {
        this._destroyMarker(n);
    }

    // Destroy marker by id
    destroyMarkerId(id) {
        this.destroyMarker(this._findMarkerIndex(id));
    }

    /*	Navigation
    ================================================== */
    goTo(n, fast, css_animation) {
        var self = this,
            _ease = this.options.ease,
            _duration = this.options.duration,
            _n = (n < 0) ? 0 : n;

        // Set Marker active state
        this._resetMarkersActive();
        if (n >= 0 && n < this._markers.length) {
            this._markers[n].setActive(true);
        }

        this.animateMovement(_n, fast, css_animation, _duration, _ease);

        if (n >= 0 && n < this._markers.length) {
            this.current_id = this.current_focused_id = this._markers[n].data.unique_id;
        } else {
            this.current_id = this.current_focused_id = '';
        }

        this._setLabelWithCurrentMarker();
    }

    goToId(id, fast, css_animation) {
        this.goTo(this._findMarkerIndex(id), fast, css_animation);
    }

    focusOn(n, fast, css_animation) {
        const _ease = this.options.ease,
            _duration = this.options.duration,
            _n = (n < 0) ? 0 : n;

        this.animateMovement(_n, fast, css_animation, _duration, _ease);

        this._resetMarkersBlurListeners();
        if (n >= 0 && n < this._markers.length) {
            this._markers[n].setFocus();
            this.current_focused_id = this._markers[n].data.unique_id;
            this._markers[n].on('markerblur', this._onMarkerBlur, this);
        }
    }

    focusNext() {
        const n = this._findMarkerIndex(this.current_focused_id);
        if ((n + 1) < this._markers.length) {
            this.focusOn(n + 1);
        } else {
            this.focusOn(n);
        }
    }

    focusPrevious() {
        const n = this._findMarkerIndex(this.current_focused_id);
        if (n - 1 >= 0) {
            this.focusOn(n - 1);
        } else {
            this.focusOn(n);
        }
    }

    animateMovement(n, fast, css_animation, duration, ease) {
        // Stop animation
        if (this.animator) {
            this.animator.stop();
        }

        if (fast) {
            this._el.slider.className = "tl-timenav-slider";
            this._el.slider.style.left = -this._markers[n].getLeft() +
                (this.options.width / 2) + "px";
        } else {
            if (css_animation) {
                this._el.slider.className = "tl-timenav-slider tl-timenav-slider-animate";
                this.animate_css = true;
                this._el.slider.style.left = -this._markers[n].getLeft() +
                    (this.options.width / 2) + "px";
            } else {
                this._el.slider.className = "tl-timenav-slider";
                this.animator = (0,_animation_Animate__WEBPACK_IMPORTED_MODULE_12__.Animate)(this._el.slider, {
                    left: -this._markers[n].getLeft() +
                        (this.options.width / 2) + "px",
                    duration: duration,
                    easing: ease
                });
            }
        }

        if (n >= 0 && n < this._markers.length) {
            this.current_id = this._markers[n].data.unique_id;
        } else {
            this.current_id = '';
        }

        this._dispatchVisibleTicksChange();
    }

    goToId(id, fast, css_animation) {
        this.goTo(this._findMarkerIndex(id), fast, css_animation);
    }

    _dispatchVisibleTicksChange() {
        /**
         * The timeout is required to wait till the end of the animation
         * and repositioning of the ticks on the screen
         */
        if (this.ticks_change_timeout) {
            clearTimeout(this.ticks_change_timeout);
            this.ticks_change_timeout = null;
        }
        this.ticks_change_timeout = setTimeout(() => {
            const visible_ticks = this.timeaxis.getVisibleTicks();
            this.fire("visible_ticks_change", { visible_ticks });
        }, this.options.duration);
    }

    /*	Events
    ================================================== */
    _onLoaded() {
        this.ready = true;
        this.fire("loaded", this.config);
    }

    _onMarkerAdded(e) {
        this.fire("dateAdded", this.config);
    }

    _onEraAdded(e) {
        this.fire("eraAdded", this.config);
    }

    _onMarkerRemoved(e) {
        this.fire("dateRemoved", this.config);
    }

    _onMarkerClick(e) {
        // Go to the clicked marker
        this.goToId(e.unique_id);
        this.fire("change", { unique_id: e.unique_id });
    }

    _onMarkerBlur(e) {
        // Reset the focused marked to the active marker after it lost the focus
        if (this.current_focused_id === this.current_id) return;
        this.focusOn(this._findMarkerIndex(this.current_id));
    }

    _onMouseScroll(e) {

        var delta = 0,
            scroll_to = 0,
            constraint = {
                right: -(this.timescale.getPixelWidth() - (this.options.width / 2)),
                left: this.options.width / 2
            };
        if (!e) {
            e = window.event;
        }
        if (e.originalEvent) {
            e = e.originalEvent;
        }

        // Webkit and browsers able to differntiate between up/down and left/right scrolling
        if (typeof e.wheelDeltaX != 'undefined') {
            delta = e.wheelDeltaY / 6;
            if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY)) {
                delta = e.wheelDeltaX / 6;
            } else {
                //delta = e.wheelDeltaY/6;
                delta = 0;
            }
        }
        if (delta) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }
        // Stop from scrolling too far
        scroll_to = parseInt(this._el.slider.style.left.replace("px", "")) + delta;


        if (scroll_to > constraint.left) {
            scroll_to = constraint.left;
        } else if (scroll_to < constraint.right) {
            scroll_to = constraint.right;
        }

        if (this.animate_css) {
            this._el.slider.className = "tl-timenav-slider";
            this.animate_css = false;
        }

        this._el.slider.style.left = scroll_to + "px";

    }

    _onDragMove(e) {
        if (this.animate_css) {
            this._el.slider.className = "tl-timenav-slider";
            this.animate_css = false;
        }

    }

    _onKeydown(e) {
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_3__.DOMEvent.stopPropagation(e);

        switch (e.key) {
            case "ArrowUp":
            case "ArrowRight":
                {
                    this.focusNext();
                    break;
                }
            case "ArrowDown":
            case "ArrowLeft":
                {
                    this.focusPrevious();
                    break;
                }
            case "Home":
                {
                    this.focusOn(0);
                    break;
                }
            case "End":
                {
                    this.focusOn(this._markers.length - 1);
                    break;
                }
        }
    }

    /*	Private Methods
    ================================================== */

    _drawTimeline(fast) {
        this.timescale = this._getTimeScale();
        this.timeaxis.drawTicks(this.timescale, this.options.optimal_tick_width);
        this.positionMarkers(fast);
        this._assignRowsToMarkers();
        this._createGroups();
        this._positionGroups();

        if (this.has_eras) {

            this._positionEras(fast);
        }
    }

    _updateDrawTimeline(check_update) {
        var do_update = false;

        // Check to see if redraw is needed
        if (check_update) {
            /* keep this aligned with _getTimeScale or reduce code duplication */
            var temp_timescale = new _TimeScale__WEBPACK_IMPORTED_MODULE_6__.TimeScale(this.config, {
                display_width: this._el.container.offsetWidth,
                screen_multiplier: this.options.scale_factor,
                max_rows: this.max_rows

            });

            if (this.timescale.getMajorScale() == temp_timescale.getMajorScale() &&
                this.timescale.getMinorScale() == temp_timescale.getMinorScale()) {
                do_update = true;
            }
        } else {
            do_update = true;
        }

        // Perform update or redraw
        if (do_update) {
            this.timescale = this._getTimeScale();
            this.timeaxis.positionTicks(this.timescale, this.options.optimal_tick_width);
            this.positionMarkers();
            this._assignRowsToMarkers();
            this._positionGroups();
            if (this.has_eras) {
                this._positionEras();
            }
            this.updateDisplay();
        } else {
            this._drawTimeline(true);
        }

        return do_update;

    }

    _setLabelWithCurrentMarker() {
        const currentMarker = this._markers[this._findMarkerIndex(this.current_focused_id)];
        const currentMarkerText = currentMarker && currentMarker.ariaLabel ?
            `, ${currentMarker.ariaLabel}, shown` :
            '';
        this._el.container.setAttribute('aria-label', `Timeline navigation ${currentMarkerText}`);
    }

    /*	Init
    ================================================== */
    _initLayout() {
        // Create Layout
        this._el.line = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create('div', 'tl-timenav-line', this._el.container);
        this._el.slider = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create('div', 'tl-timenav-slider', this._el.container);
        this._el.slider_background = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create('div', 'tl-timenav-slider-background', this._el.slider);
        this._el.marker_container_mask = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create('div', 'tl-timenav-container-mask', this._el.slider);
        this._el.marker_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create('div', 'tl-timenav-container', this._el.marker_container_mask);
        this._el.marker_item_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create('div', 'tl-timenav-item-container', this._el.marker_container);
        this._el.timeaxis = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create('div', 'tl-timeaxis', this._el.slider);
        this._el.timeaxis_background = _dom_DOM__WEBPACK_IMPORTED_MODULE_4__.create('div', 'tl-timeaxis-background', this._el.container);

        // Time Axis
        this.timeaxis = new _TimeAxis__WEBPACK_IMPORTED_MODULE_9__.TimeAxis(this._el.timeaxis, this.options, this.language);

        // Swipable
        this._swipable = new _ui_Swipable__WEBPACK_IMPORTED_MODULE_11__["default"](this._el.slider_background, this._el.slider, {
            enable: { x: true, y: false },
            constraint: { top: false, bottom: false, left: (this.options.width / 2), right: false },
            snap: false
        });
        this._swipable.enable();

    }

    _initEvents() {
        // Drag Events
        this._swipable.on('dragmove', this._onDragMove, this);

        // Scroll Events
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_3__.DOMEvent.addListener(this._el.container, 'mousewheel', this._onMouseScroll, this);
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_3__.DOMEvent.addListener(this._el.container, 'DOMMouseScroll', this._onMouseScroll, this);
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_3__.DOMEvent.addListener(this._el.container, 'keydown', this._onKeydown, this);
    }

    _initData() {
        // Create Markers and then add them
        this._createMarkers(this.config.events);

        if (this.config.eras && this.config.eras.length > 0) {
            this.has_eras = true;
            this._createEras(this.config.eras);
        }

        this._drawTimeline();

    }
}

(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.classMixin)(TimeNav, _core_Events__WEBPACK_IMPORTED_MODULE_1__["default"], _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_2__.DOMMixins, _language_I18NMixins__WEBPACK_IMPORTED_MODULE_13__.I18NMixins)


/***/ }),

/***/ "./src/js/timenav/TimeScale.js":
/*!*************************************!*\
  !*** ./src/js/timenav/TimeScale.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimeScale: () => (/* binding */ TimeScale)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_TLError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/TLError */ "./src/js/core/TLError.js");
/* harmony import */ var _date_TLDate__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../date/TLDate */ "./src/js/date/TLDate.js");
/* harmony import */ var _AxisHelper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./AxisHelper */ "./src/js/timenav/AxisHelper.js");






// Date Format Lookup, map TLDate.SCALES names to...
const AXIS_TICK_DATEFORMAT_LOOKUP = {
    millisecond: 'time_milliseconds', // ...Language.<code>.dateformats
    second: 'time_short',
    minute: 'time_no_seconds_short',
    hour: 'time_no_minutes_short',
    day: 'full_short',
    month: 'month_short',
    year: 'year',
    decade: 'year',
    century: 'year',
    millennium: 'year',
    age: 'compact', // ...Language.<code>.bigdateformats
    epoch: 'compact',
    era: 'compact',
    eon: 'compact',
    eon2: 'compact'
}

class TimeScale {

    constructor(timeline_config, options) {

        var slides = timeline_config.events;
        this._scale = timeline_config.scale;
        this._slides = slides; // STORE SLIDES REFERENCE FOR LEVEL ACCESS
        
        options = (0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)({ // establish defaults
            display_width: 500,
            screen_multiplier: 3,
            max_rows: null
        }, options);

        this._display_width = options.display_width;
        this._screen_multiplier = options.screen_multiplier;
        this._pixel_width = this._screen_multiplier * this._display_width;

        this._group_labels = undefined;
        this._positions = []; // INITIALIZE POSITIONS ARRAY
        this._pixels_per_milli = 0;

        this._earliest = timeline_config.getEarliestDate().getTime();
        this._latest = timeline_config.getLatestDate().getTime();
        this._span_in_millis = this._latest - this._earliest;
        if (this._span_in_millis <= 0) {
            this._span_in_millis = this._computeDefaultSpan(timeline_config);
        }
        this._average = (this._span_in_millis) / slides.length;

        this._pixels_per_milli = this.getPixelWidth() / this._span_in_millis;

        this._axis_helper = (0,_AxisHelper__WEBPACK_IMPORTED_MODULE_3__.getBestHelper)(this);

        this._scaled_padding = (1 / this.getPixelsPerTick()) * (this._display_width / 2)
        this._computePositionInfo(slides, options.max_rows);
    }

    _computeDefaultSpan(timeline_config) {
        // this gets called when all events are at the same instant,
        // or maybe when the span_in_millis is > 0 but still below a desired threshold
        if (timeline_config.scale == 'human') {
            var formats = {}
            for (var i = 0; i < timeline_config.events.length; i++) {
                var fmt = timeline_config.events[i].start_date.findBestFormat();
                formats[fmt] = (formats[fmt]) ? formats[fmt] + 1 : 1;
            };

            for (var i = _date_TLDate__WEBPACK_IMPORTED_MODULE_2__.SCALES.length - 1; i >= 0; i--) {
                if (formats.hasOwnProperty(_date_TLDate__WEBPACK_IMPORTED_MODULE_2__.SCALES[i][0])) {
                    var scale = _date_TLDate__WEBPACK_IMPORTED_MODULE_2__.SCALES[_date_TLDate__WEBPACK_IMPORTED_MODULE_2__.SCALES.length - 1]; // default
                    if (_date_TLDate__WEBPACK_IMPORTED_MODULE_2__.SCALES[i + 1]) {
                        scale = _date_TLDate__WEBPACK_IMPORTED_MODULE_2__.SCALES[i + 1]; // one larger than the largest in our data
                    }
                    return scale[1]
                }
            };
            return 365 * 24 * 60 * 60 * 1000; // default to a year?
        }

        return 200000; // what is the right handling for cosmo dates?
    }
    
    getGroupLabels() {
        return (this._group_labels || []);
    }

    getScale() {
        return this._scale;
    }

    getNumberOfRows() {
        return this._number_of_rows
    }

    getPixelWidth() {
        return this._pixel_width;
    }

    getPosition(time_in_millis) {
        return (time_in_millis - this._earliest) * this._pixels_per_milli
    }

    getPositionInfo(idx) {
        return this._positions[idx];
    }

    getPixelsPerTick() {
        return this._axis_helper.getPixelsPerTick(this._pixels_per_milli);
    }

    getTicks() {
        return {
            major: this._axis_helper.getMajorTicks(this),
            minor: this._axis_helper.getMinorTicks(this)
        }
    }

    getDateFromTime(t) {
        if (this._scale == 'human') {
            return new _date_TLDate__WEBPACK_IMPORTED_MODULE_2__.TLDate(t);
        } else if (this._scale == 'cosmological') {
            return new _date_TLDate__WEBPACK_IMPORTED_MODULE_2__.BigDate(new _date_TLDate__WEBPACK_IMPORTED_MODULE_2__.BigYear(t));
        }
        throw new _core_TLError__WEBPACK_IMPORTED_MODULE_1__["default"]("time_scale_scale_err", this._scale);
    }

    getMajorScale() {
        return this._axis_helper.major.name;
    }

    getMinorScale() {
        return this._axis_helper.minor.name;
    }

    _assessGroups(slides) {
        var groups = [];
        var empty_group = false;
        for (var i = 0; i < slides.length; i++) {
            if (slides[i].group) {
                if (groups.indexOf(slides[i].group) < 0) {
                    groups.push(slides[i].group);
                } else {
                    empty_group = true;
                }
            }
        };
        if (groups.length && empty_group) {
            groups.push('');
        }
        return groups;
    }

    /*  Compute the marker row positions, minimizing the number of overlaps */
    /*  Compute the marker row positions, minimizing the number of overlaps */
_computeRowInfo(positions, rows_left, group_index = null) {
    var lasts_in_row = [];
    var n_overlaps = 0;
    
    // STEP 1: First pass - find the maximum manual level requested WITHIN THIS GROUP
    var max_manual_level = -1;
    for (var i = 0; i < positions.length; i++) {
        var slide_index = this._findSlideIndexByStartDate(pos_info.start_date_millis);
        
        if (slide_index >= 0 && this._slides[slide_index] && 
            this._slides[slide_index].level !== undefined && 
            this._slides[slide_index].level !== null) {
            
            var manual_level = parseInt(this._slides[slide_index].level);
            if (!isNaN(manual_level) && manual_level > max_manual_level) {
                max_manual_level = manual_level;
            }
        }
    }
    
    // STEP 2: Pre-create all levels needed for manual assignments
    var total_levels_needed = Math.max(max_manual_level + 1, 0);
    for (var l = 0; l < total_levels_needed; l++) {
        lasts_in_row.push(null);
    }

    // STEP 3: Process each event
    for (var i = 0; i < positions.length; i++) {
        var pos_info = positions[i];

        // Find the corresponding slide to get level information
        var slide_index = this._slides.findIndex(s => 
            s.start_date.getTime() === pos_info.start_date_millis
        );
        
        var current_slide = slide_index >= 0 ? this._slides[slide_index] : null;

        // Handle manual level assignment from slide data
        if (current_slide && current_slide.level !== undefined && current_slide.level !== null) {
            var manual_level = parseInt(current_slide.level);
            
            if (!isNaN(manual_level) && manual_level >= 0) {
                // Ensure the manual level exists (create if needed)
                while (lasts_in_row.length <= manual_level) {
                    lasts_in_row.push(null);
                }
                
                // FORCE the event to the manual level WITHIN THIS GROUP
                pos_info.row = manual_level;
                pos_info.level = manual_level; // Store level for rendering
                lasts_in_row[manual_level] = pos_info;
                continue; // Skip automatic layout
            }
        }

        // Automatic layout for events without manual levels
        delete pos_info.row;
        var overlaps = [];

        for (var j = 0; j < lasts_in_row.length; j++) {
            overlaps.push(lasts_in_row[j] ? lasts_in_row[j].end - pos_info.start : -1);
            if(overlaps[j] <= 0) {
                pos_info.row = j;
                pos_info.level = j; // Store level for rendering
                lasts_in_row[j] = pos_info;
                break;
            }
        }

        if (typeof(pos_info.row) == 'undefined') {
            if (rows_left === null) {
                pos_info.row = lasts_in_row.length;
                pos_info.level = lasts_in_row.length;
                lasts_in_row.push(pos_info);
            } else if (rows_left > 0) {
                pos_info.row = lasts_in_row.length;
                pos_info.level = lasts_in_row.length;
                lasts_in_row.push(pos_info);
                rows_left--;
            } else {
                var min_overlap = Math.min.apply(null, overlaps);
                var idx = overlaps.indexOf(min_overlap);
                pos_info.row = idx;
                pos_info.level = idx;
                if (pos_info.end > lasts_in_row[idx].end) {
                    lasts_in_row[idx] = pos_info;
                }
                n_overlaps++;
            }
        }
    }

    return {n_rows: lasts_in_row.length, n_overlaps: n_overlaps};
}

    /*  Compute marker positions */
    _computePositionInfo(slides, max_rows, default_marker_width) {
        default_marker_width = default_marker_width || 100;

        // Make sure _positions is initialized (THIS WAS MISSING)
        if (!this._positions) {
            this._positions = [];
        }
        
        var groups = [];
        var empty_group = false;

        // Set start/end/width; enumerate groups
        for (var i = 0; i < slides.length; i++) {
        var pos_info = {
        start: this.getPosition(slides[i].start_date.getTime()),
        start_date_millis: slides[i].start_date.getTime() // STORE FOR LEVEL LOOKUP
        };
        this._positions.push(pos_info);

            if (typeof(slides[i].end_date) != 'undefined') {
                var end_pos = this.getPosition(slides[i].end_date.getTime());
                pos_info.width = end_pos - pos_info.start;
                if (pos_info.width > default_marker_width) {
                    pos_info.end = pos_info.start + pos_info.width;
                } else {
                    pos_info.end = pos_info.start + default_marker_width;
                }
            } else {
                pos_info.width = default_marker_width;
                pos_info.end = pos_info.start + default_marker_width;
            }

            if (slides[i].group) {
                if (groups.indexOf(slides[i].group) < 0) {
                    groups.push(slides[i].group);
                }
            } else {
                empty_group = true;
            }
        }

        if (!(groups.length)) {
            var result = this._computeRowInfo(this._positions, max_rows);
            this._number_of_rows = result.n_rows;
        } else {
            if (empty_group) {
                groups.push("");
            }

            // Init group info
            var group_info = [];

            for (var i = 0; i < groups.length; i++) {
                group_info[i] = {
                    label: groups[i],
                    idx: i,
                    positions: [],
                    n_rows: 1, // default
                    n_overlaps: 0
                };
            }

            for (var i = 0; i < this._positions.length; i++) {
                var pos_info = this._positions[i];

                pos_info.group = groups.indexOf(slides[i].group || "");
                pos_info.row = 0;

                var gi = group_info[pos_info.group];
                for (var j = gi.positions.length - 1; j >= 0; j--) {
                    if (gi.positions[j].end > pos_info.start) {
                        gi.n_overlaps++;
                    }
                }

                gi.positions.push(pos_info);
            }

            var n_rows = groups.length; // start with 1 row per group

            while (true) {
                // Count free rows available
                var rows_left = Math.max(0, max_rows - n_rows);
                if (!rows_left) {
                    break; // no free rows, nothing to do
                }

                // Sort by # overlaps, idx
                group_info.sort(function(a, b) {
                    if (a.n_overlaps > b.n_overlaps) {
                        return -1;
                    } else if (a.n_overlaps < b.n_overlaps) {
                        return 1;
                    }
                    return a.idx - b.idx;
                });
                if (!group_info[0].n_overlaps) {
                    break; // no overlaps, nothing to do
                }

                // Distribute free rows among groups with overlaps
                var n_rows = 0;
                for (var i = 0; i < group_info.length; i++) {
                    var gi = group_info[i];

                    if (gi.n_overlaps && rows_left) {
                    var res = this._computeRowInfo(gi.positions, gi.n_rows + 1, gi.idx);
                    gi.n_rows = res.n_rows; // update group info
                    gi.n_overlaps = res.n_overlaps;
                    rows_left--; // update rows left
                    }

                    n_rows += gi.n_rows; // update rows used
                }
            }

            // Set number of rows
            this._number_of_rows = n_rows;

            // Set group labels; offset row positions
            this._group_labels = [];

            group_info.sort(function(a, b) { return a.idx - b.idx; });

            for (var i = 0, row_offset = 0; i < group_info.length; i++) {
                this._group_labels.push({
                    label: group_info[i].label,
                    rows: group_info[i].n_rows
                });

                for (var j = 0; j < group_info[i].positions.length; j++) {
                    var pos_info = group_info[i].positions[j];
                    pos_info.row += row_offset;
                }

                row_offset += group_info[i].n_rows;
            }
        }
    }

        getAxisTickDateFormat(name) {
        if (this._scale == 'cosmological') {
            return 'compact'
        }
        return AXIS_TICK_DATEFORMAT_LOOKUP[name];
    }

    // ADD THIS HELPER FUNCTION AS A SEPARATE METHOD:
    _findSlideIndexByStartDate(start_date_millis) {
        for (var i = 0; i < this._slides.length; i++) {
            if (this._slides[i].start_date.getTime() === start_date_millis) {
                return i;
            }
        }
        return -1;
    }
}


/***/ }),

/***/ "./src/js/ui/Draggable.js":
/*!********************************!*\
  !*** ./src/js/ui/Draggable.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Draggable: () => (/* binding */ Draggable)
/* harmony export */ });
/* harmony import */ var _core_TLClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/TLClass */ "./src/js/core/TLClass.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Browser */ "./src/js/core/Browser.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");
/* harmony import */ var _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../dom/DOMEvent */ "./src/js/dom/DOMEvent.js");
/* harmony import */ var _animation_Animate__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../animation/Animate */ "./src/js/animation/Animate.js");
/* harmony import */ var _animation_Ease__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../animation/Ease */ "./src/js/animation/Ease.js");
/*	Draggable
	Draggable allows you to add dragging capabilities to any element. Supports mobile devices too.
================================================== */









class Draggable{

    constructor(drag_elem, options, move_elem) {
        // DOM ELements
        this._el = {
            drag: drag_elem,
            move: drag_elem
        }

        this.mousedrag = {
            down: "mousedown",
            up: "mouseup",
            leave: "mouseleave",
            move: "mousemove"
        }

        this.touchdrag = {
            down: "touchstart",
            up: "touchend",
            leave: "mouseleave",
            move: "touchmove"
        }

        if (move_elem) {
            this._el.move = move_elem;
        }

        //Options
        this.options = {
            enable: {
                x: true,
                y: true
            },
            constraint: {
                top: false,
                bottom: false,
                left: false,
                right: false
            },
            momentum_multiplier: 2000,
            duration: 1000,
            ease: _animation_Ease__WEBPACK_IMPORTED_MODULE_7__.easeInOutQuint
        };

        // Animation Object
        this.animator = null;

        // Drag Event Type
        this.dragevent = this.mousedrag;

        if (_core_Browser__WEBPACK_IMPORTED_MODULE_2__.touch) {
            this.dragevent = this.touchdrag;
        }

        // Draggable Data
        this.data = {
            sliding: false,
            direction: "none",
            pagex: {
                start: 0,
                end: 0
            },
            pagey: {
                start: 0,
                end: 0
            },
            pos: {
                start: {
                    x: 0,
                    y: 0
                },
                end: {
                    x: 0,
                    y: 0
                }
            },
            new_pos: {
                x: 0,
                y: 0
            },
            new_pos_parent: {
                x: 0,
                y: 0
            },
            time: {
                start: 0,
                end: 0
            },
            touch: false
        };

        // Merge Data and Options
        (0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.mergeData)(this.options, options);
    }

    enable(e) {
        this.data.pos.start = 0;
        this._el.move.style.left = this.data.pos.start.x + "px";
        this._el.move.style.top = this.data.pos.start.y + "px";
        this._el.move.style.position = "absolute";
    }

    disable() {
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.removeListener(
            this._el.drag,
            this.dragevent.down,
            this._onDragStart,
            this
        );
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.removeListener(
            this._el.drag,
            this.dragevent.up,
            this._onDragEnd,
            this
        );
    }

    stopMomentum() {
        if (this.animator) {
            this.animator.stop();
        }
    }

    updateConstraint(c) {
        this.options.constraint = c;
    }

    /*	Private Methods
	================================================== */
    _onDragStart(e) {
        if (_core_Browser__WEBPACK_IMPORTED_MODULE_2__.touch) {
            if (e.originalEvent) {
                this.data.pagex.start = e.originalEvent.touches[0].screenX;
                this.data.pagey.start = e.originalEvent.touches[0].screenY;
            } else {
                this.data.pagex.start = e.targetTouches[0].screenX;
                this.data.pagey.start = e.targetTouches[0].screenY;
            }
        } else {
            this.data.pagex.start = e.pageX;
            this.data.pagey.start = e.pageY;
        }

        // Center element to finger or mouse
        if (this.options.enable.x) {
            this._el.move.style.left =
                this.data.pagex.start - this._el.move.offsetWidth / 2 + "px";
        }

        if (this.options.enable.y) {
            this._el.move.style.top =
                this.data.pagey.start - this._el.move.offsetHeight / 2 + "px";
        }

        this.data.pos.start = (0,_dom_DOM__WEBPACK_IMPORTED_MODULE_4__.getPosition)(this._el.drag);
        this.data.time.start = new Date().getTime();

        this.fire("dragstart", this.data);
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.addListener(
            this._el.drag,
            this.dragevent.move,
            this._onDragMove,
            this
        );
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.addListener(
            this._el.drag,
            this.dragevent.leave,
            this._onDragEnd,
            this
        );
    }

    _onDragEnd(e) {
        this.data.sliding = false;
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.removeListener(
            this._el.drag,
            this.dragevent.move,
            this._onDragMove,
            this
        );
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.removeListener(
            this._el.drag,
            this.dragevent.leave,
            this._onDragEnd,
            this
        );
        this.fire("dragend", this.data);

        //  momentum
        this._momentum();
    }

    _onDragMove(e) {
        e.preventDefault();
        this.data.sliding = true;

        if (_core_Browser__WEBPACK_IMPORTED_MODULE_2__.touch) {
            if (e.originalEvent) {
                this.data.pagex.end = e.originalEvent.touches[0].screenX;
                this.data.pagey.end = e.originalEvent.touches[0].screenY;
            } else {
                this.data.pagex.end = e.targetTouches[0].screenX;
                this.data.pagey.end = e.targetTouches[0].screenY;
            }
        } else {
            this.data.pagex.end = e.pageX;
            this.data.pagey.end = e.pageY;
        }

        this.data.pos.end = (0,_dom_DOM__WEBPACK_IMPORTED_MODULE_4__.getPosition)(this._el.drag);
        this.data.new_pos.x = -(
            this.data.pagex.start -
            this.data.pagex.end -
            this.data.pos.start.x
        );
        this.data.new_pos.y = -(
            this.data.pagey.start -
            this.data.pagey.end -
            this.data.pos.start.y
        );

        if (this.options.enable.x) {
            this._el.move.style.left = this.data.new_pos.x + "px";
        }

        if (this.options.enable.y) {
            this._el.move.style.top = this.data.new_pos.y + "px";
        }

        this.fire("dragmove", this.data);
    }

    _momentum() {
        var pos_adjust = {
                x: 0,
                y: 0,
                time: 0
            },
            pos_change = {
                x: 0,
                y: 0,
                time: 0
            },
            swipe = false,
            swipe_direction = "";

        if (_core_Browser__WEBPACK_IMPORTED_MODULE_2__.touch) {
            // Treat mobile multiplier differently
            //this.options.momentum_multiplier = this.options.momentum_multiplier * 2;
        }

        pos_adjust.time = (new Date().getTime() - this.data.time.start) * 10;
        pos_change.time = (new Date().getTime() - this.data.time.start) * 10;

        pos_change.x =
            this.options.momentum_multiplier *
            (Math.abs(this.data.pagex.end) - Math.abs(this.data.pagex.start));
        pos_change.y =
            this.options.momentum_multiplier *
            (Math.abs(this.data.pagey.end) - Math.abs(this.data.pagey.start));

        pos_adjust.x = Math.round(pos_change.x / pos_change.time);
        pos_adjust.y = Math.round(pos_change.y / pos_change.time);

        this.data.new_pos.x = Math.min(this.data.pos.end.x + pos_adjust.x);
        this.data.new_pos.y = Math.min(this.data.pos.end.y + pos_adjust.y);

        if (!this.options.enable.x) {
            this.data.new_pos.x = this.data.pos.start.x;
        } else if (this.data.new_pos.x < 0) {
            this.data.new_pos.x = 0;
        }

        if (!this.options.enable.y) {
            this.data.new_pos.y = this.data.pos.start.y;
        } else if (this.data.new_pos.y < 0) {
            this.data.new_pos.y = 0;
        }

        // Detect Swipe
        if (pos_change.time < 3000) {
            swipe = true;
        }

        // Detect Direction
        if (Math.abs(pos_change.x) > 10000) {
            this.data.direction = "left";
            if (pos_change.x > 0) {
                this.data.direction = "right";
            }
        }
        // Detect Swipe
        if (Math.abs(pos_change.y) > 10000) {
            this.data.direction = "up";
            if (pos_change.y > 0) {
                this.data.direction = "down";
            }
        }
        this._animateMomentum();
        if (swipe) {
            this.fire("swipe_" + this.data.direction, this.data);
        }
    }

    _animateMomentum() {
        var pos = {
                x: this.data.new_pos.x,
                y: this.data.new_pos.y
            },
            animate = {
                duration: this.options.duration,
                easing: _animation_Ease__WEBPACK_IMPORTED_MODULE_7__.easeOutStrong
            };

        if (this.options.enable.y) {
            if (this.options.constraint.top || this.options.constraint.bottom) {
                if (pos.y > this.options.constraint.bottom) {
                    pos.y = this.options.constraint.bottom;
                } else if (pos.y < this.options.constraint.top) {
                    pos.y = this.options.constraint.top;
                }
            }
            animate.top = Math.floor(pos.y) + "px";
        }

        if (this.options.enable.x) {
            if (this.options.constraint.left || this.options.constraint.right) {
                if (pos.x > this.options.constraint.left) {
                    pos.x = this.options.constraint.left;
                } else if (pos.x < this.options.constraint.right) {
                    pos.x = this.options.constraint.right;
                }
            }
            animate.left = Math.floor(pos.x) + "px";
        }

        this.animator = (0,_animation_Animate__WEBPACK_IMPORTED_MODULE_6__.Animate)(this._el.move, animate);

        this.fire("momentum", this.data);
    }
}

(0,_core_Util__WEBPACK_IMPORTED_MODULE_3__.classMixin)(_core_Events__WEBPACK_IMPORTED_MODULE_1__["default"])

/***/ }),

/***/ "./src/js/ui/MenuBar.js":
/*!******************************!*\
  !*** ./src/js/ui/MenuBar.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MenuBar: () => (/* binding */ MenuBar)
/* harmony export */ });
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Browser */ "./src/js/core/Browser.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../dom/DOMMixins */ "./src/js/dom/DOMMixins.js");
/* harmony import */ var _animation_Ease__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../animation/Ease */ "./src/js/animation/Ease.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../dom/DOMEvent */ "./src/js/dom/DOMEvent.js");
/* harmony import */ var _language_I18NMixins__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../language/I18NMixins */ "./src/js/language/I18NMixins.js");









class MenuBar {
    constructor(elem, parent_elem, options, language) {
        // DOM ELEMENTS
        this._el = {
            parent: {},
            container: {},
            button_forwardtoend: {},
            button_backtostart: {},
            button_zoomin: {},
            button_zoomout: {},
            arrow: {},
            line: {},
            coverbar: {},
            grip: {}
        };

        this.collapsed = false;

        if (typeof elem === 'object') {
            this._el.container = elem;
        } else {
            this._el.container = _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.get(elem);
        }

        if (parent_elem) {
            this._el.parent = parent_elem;
        }

        // Data
        this.data = {
            visible_ticks_dates: {}
        }

        //Options
        this.options = {
            width: 600,
            height: 600,
            duration: 1000,
            ease: _animation_Ease__WEBPACK_IMPORTED_MODULE_4__.easeInOutQuint,
            menubar_default_y: 0
        };

        // Animation
        this.animator = {};

        this.setLanguage(language)

        // Merge Data and Options
        ;(0,_core_Util__WEBPACK_IMPORTED_MODULE_5__.mergeData)(this.options, options);

        this._initLayout();
        this._initEvents();
    }

    /*	Public
    ================================================== */
    show(d) {

        var duration = this.options.duration;
        if (d) {
            duration = d;
        }
    }

    hide(top) {}

    toogleZoomIn(show) {
        if (show) {
            this._el.button_zoomin.removeAttribute('disabled');
        } else {
            this._el.button_zoomin.setAttribute('disabled', true);
        }
    }

    toogleZoomOut(show) {
        if (show) {
            this._el.button_zoomout.removeAttribute('disabled');
        } else {
            this._el.button_zoomout.setAttribute('disabled', true);
        }
    }

    changeVisibleTicks(visible_ticks) {
        const minor_ticks = visible_ticks.minor;
        if (!minor_ticks.length) {
            this.data.visible_ticks_dates = {};
            return;
        }

        const firstTick = minor_ticks[0];
        const firstYear = firstTick.date.getFullYear();

        const lastTick = minor_ticks[minor_ticks.length - 1];
        const lastYear = lastTick.date.getFullYear();

        this.data.visible_ticks_dates = {
            start: firstYear,
            end: lastYear
        };

        this._updateZoomAriaLabels()
    }

    setSticky(y) {
        this.options.menubar_default_y = y;
    }

    /*	Color
    ================================================== */
    setColor(inverted) {
        if (inverted) {
            this._el.container.className = 'tl-menubar tl-menubar-inverted';
        } else {
            this._el.container.className = 'tl-menubar';
        }
    }

    /*	Update Display
    ================================================== */
    updateDisplay(w, h, a, l) {
        this._updateDisplay(w, h, a, l);
    }

    /*	Events
    ================================================== */
    _onButtonZoomIn(e) {
        this.fire("zoom_in", e);
    }

    _onButtonZoomOut(e) {
        this.fire("zoom_out", e);
    }

    _onButtonForwardToEnd(e) {
        this.fire("forward_to_end", e);
    }

    _onButtonBackToStart(e) {
        this.fire("back_to_start", e);
    }


    /*	Private Methods
    ================================================== */
    _initLayout() {

        // Create Layout
        this._el.button_zoomin = _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.createButton('tl-menubar-button', this._el.container);
        this._el.button_zoomout = _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.createButton('tl-menubar-button', this._el.container);
        this._el.button_forwardtoend = _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.createButton('tl-menubar-button', this._el.container);
        this._el.button_backtostart = _dom_DOM__WEBPACK_IMPORTED_MODULE_0__.createButton('tl-menubar-button', this._el.container);

        if (_core_Browser__WEBPACK_IMPORTED_MODULE_1__.mobile) {
            this._el.container.setAttribute("ontouchstart", " ");
        }

        this._el.button_backtostart.innerHTML = "<span class='tl-icon-goback'></span>";
        this._el.button_backtostart.setAttribute('aria-label', this._('return_to_title'));

        this._el.button_forwardtoend.innerHTML = "<span class='tl-icon-goend'></span>";
        this._el.button_forwardtoend.setAttribute('aria-label', this._('go_to_end'));

        this._el.button_zoomin.innerHTML = "<span class='tl-icon-zoom-in'></span>";
        this._el.button_zoomin.setAttribute('aria-label', this._('zoom_in'));

        this._el.button_zoomout.innerHTML = "<span class='tl-icon-zoom-out'></span>";
        this._el.button_zoomout.setAttribute('aria-label', this._('zoom_out'));
    }

    _initEvents() {
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_6__.DOMEvent.addListener(this._el.button_forwardtoend, 'click', this._onButtonForwardToEnd, this);
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_6__.DOMEvent.addListener(this._el.button_backtostart, 'click', this._onButtonBackToStart, this);
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_6__.DOMEvent.addListener(this._el.button_zoomin, 'click', this._onButtonZoomIn, this);
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_6__.DOMEvent.addListener(this._el.button_zoomout, 'click', this._onButtonZoomOut, this);
    }

    // Update Display
    _updateDisplay(width, height, animate) {

        if (width) {
            this.options.width = width;
        }
        if (height) {
            this.options.height = height;
        }
    }

    // Update Display
    _updateZoomAriaLabels() {
        if (Object.keys(this.data.visible_ticks_dates).length == 0) {
            this._el.button_zoomin.setAttribute('aria-description', '');
            this._el.button_zoomout.setAttribute('aria-description', '');
        } else {
            this._el.button_zoomin.setAttribute('aria-description',
                this._("aria_label_zoomin",
                    this.data.visible_ticks_dates));
            this._el.button_zoomout.setAttribute('aria-description',
                this._("aria_label_zoomout",
                    this.data.visible_ticks_dates));
        }
    }
}

(0,_core_Util__WEBPACK_IMPORTED_MODULE_5__.classMixin)(MenuBar, _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_3__.DOMMixins, _core_Events__WEBPACK_IMPORTED_MODULE_2__["default"], _language_I18NMixins__WEBPACK_IMPORTED_MODULE_7__.I18NMixins)

/***/ }),

/***/ "./src/js/ui/Message.js":
/*!******************************!*\
  !*** ./src/js/ui/Message.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Message)
/* harmony export */ });
/* harmony import */ var _core_TLClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/TLClass */ "./src/js/core/TLClass.js");
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _dom_DOM__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../dom/DOM */ "./src/js/dom/DOM.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../dom/DOMMixins */ "./src/js/dom/DOMMixins.js");
/* harmony import */ var _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../dom/DOMEvent */ "./src/js/dom/DOMEvent.js");
/* harmony import */ var _language_I18NMixins__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../language/I18NMixins */ "./src/js/language/I18NMixins.js");
/*	Message
	
================================================== */








/**
 * A class for displaying messages to users.
 */
class Message{

    /**
     * Initialize a Message object with the container where it appears and, 
     *     optionally, a JS object of options.
     * @param {HTMLElement} container 
     * @param {object} [options] 
     */
    constructor(container, options, language) {

        if (language) {
            this.setLanguage(language)
        }
        // DOM ELEMENTS
        this._el = {
            parent: {},
            container: {},
            message_container: {},
            loading_icon: {},
            message: {}
        };

        //Options
        this.options = {
            width: 600,
            height: 600,
            message_class: "tl-message",
            message_icon_class: "tl-loading-icon"
        };

        this.container = container

        ;(0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.mergeData)(this.options, options);

        this._el.container = _dom_DOM__WEBPACK_IMPORTED_MODULE_2__.create(
            "div",
            this.options.message_class
        );

        if (container) {
            container.appendChild(this._el.container);
            this._el.parent = container;
        }

        // Animation
        this.animator = {};

        this._initLayout();
        this._initEvents();
    }

    updateMessage(t) {
        if (!t) {
            this._el.message.innerHTML = this._("loading");
        } else {
            this._el.message.innerHTML = t;
        }

        // Re-add to DOM?
        if (
            !this._el.parent.atributes &&
            this.container.attributes
        ) {
            this.container.appendChild(this._el.container);
            this._el.parent = this.container;
        }
    }

        /*	Update Display
================================================== */
    updateDisplay(w, h) {
        // no-op but probably should be implemented
    }

    _onMouseClick() {
        this.fire("clicked", this.options);
    }

    _onRemove() {
        this._el.parent = {};
    }

    _initLayout() {
        // Create Layout
        this._el.message_container = _dom_DOM__WEBPACK_IMPORTED_MODULE_2__.create(
            "div",
            "tl-message-container",
            this._el.container
        );
        this._el.loading_icon = _dom_DOM__WEBPACK_IMPORTED_MODULE_2__.create(
            "div",
            this.options.message_icon_class,
            this._el.message_container
        );
        this._el.message = _dom_DOM__WEBPACK_IMPORTED_MODULE_2__.create(
            "div",
            "tl-message-content",
            this._el.message_container
        );

        this.updateMessage();
    }

    _initEvents() {
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.addListener(this._el.container, 'click', this._onMouseClick, this);
        _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.addListener(this, 'removed', this._onRemove, this);
    }

}
(0,_core_Util__WEBPACK_IMPORTED_MODULE_1__.classMixin)(Message, _language_I18NMixins__WEBPACK_IMPORTED_MODULE_6__.I18NMixins, _core_Events__WEBPACK_IMPORTED_MODULE_3__["default"], _dom_DOMMixins__WEBPACK_IMPORTED_MODULE_4__.DOMMixins); 


/***/ }),

/***/ "./src/js/ui/Swipable.js":
/*!*******************************!*\
  !*** ./src/js/ui/Swipable.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Swipable)
/* harmony export */ });
/* harmony import */ var _core_Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Util */ "./src/js/core/Util.js");
/* harmony import */ var _core_Events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Events */ "./src/js/core/Events.js");
/* harmony import */ var _animation_Ease__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../animation/Ease */ "./src/js/animation/Ease.js");
/* harmony import */ var _animation_Animate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../animation/Animate */ "./src/js/animation/Animate.js");
/* harmony import */ var _core_Browser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Browser */ "./src/js/core/Browser.js");
/* harmony import */ var _dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../dom/DOMEvent */ "./src/js/dom/DOMEvent.js");







class Swipable {

	constructor(drag_elem, move_elem, options) {
		
		// DOM ELements 
		this._el = {
			drag: drag_elem,
			move: drag_elem
		};

		this.mousedrag = {
			down:		"mousedown",
			up:			"mouseup",
			leave:		"mouseleave",
			move:		"mousemove"
		}

		this.touchdrag = {
			down:		"touchstart",
			up:			"touchend",
			leave:		"mouseleave",
			move:		"touchmove"
		}

		if (move_elem) {
			this._el.move = move_elem;
		}
		
		//Options
		this.options = {
			snap: false,
			enable:	{
				x: true,
				y: true
			},
			constraint: {
				top: false,
				bottom: false,
				left: 0,
				right: false
			},
			momentum_multiplier: 	2000,
			duration: 				1000,
			ease: 					_animation_Ease__WEBPACK_IMPORTED_MODULE_2__.easeInOutQuint
		};
		
		
		// Animation Object
		this.animator = null;
		
		// Drag Event Type
		this.dragevent = this.mousedrag;
		
		if (_core_Browser__WEBPACK_IMPORTED_MODULE_4__.touch) {
			this.dragevent = this.touchdrag;
		}
		
		// Draggable Data
		this.data = {
			sliding:		false,
			direction: 		"none",
			pagex: {
				start:		0,
				end:		0
			},
			pagey: {
				start:		0,
				end:		0
			},
			pos: {
				start: {
					x: 0,
					y:0
				},
				end: {
					x: 0,
					y:0
				}
			},
			new_pos: {
				x: 0,
				y: 0
			},
			new_pos_parent: {
				x: 0,
				y: 0
			},
			time: {
				start:		0,
				end:		0
			},
			touch:			false
		};
		
		// Merge Data and Options
		(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.mergeData)(this.options, options);
		
		
	}
	
	enable(e) {
		_dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.addListener(this._el.drag, this.dragevent.down, this._onDragStart, this);
		_dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.addListener(this._el.drag, this.dragevent.up, this._onDragEnd, this);
		
		this.data.pos.start = 0; 
		this._el.move.style.left = this.data.pos.start.x + "px";
		this._el.move.style.top = this.data.pos.start.y + "px";
		this._el.move.style.position = "absolute";
		//this._el.move.style.zIndex = "11";
		//this._el.move.style.cursor = "move";
	}
	
	disable() {
		_dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.removeListener(this._el.drag, this.dragevent.down, this._onDragStart, this);
		_dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.removeListener(this._el.drag, this.dragevent.up, this._onDragEnd, this);
	}
	
	stopMomentum() {
		if (this.animator) {
			this.animator.stop();
		}

	}
	
	updateConstraint(c) {
		this.options.constraint = c;
		
		// Temporary until issues are fixed
		
	}
	
	/*	Private Methods
	================================================== */
	_onDragStart(e) {
		
		if (this.animator) {
			this.animator.stop();
		}
		
		if (_core_Browser__WEBPACK_IMPORTED_MODULE_4__.touch) {
			if (e.originalEvent) {
				this.data.pagex.start = e.originalEvent.touches[0].screenX;
				this.data.pagey.start = e.originalEvent.touches[0].screenY;
			} else {
				this.data.pagex.start = e.targetTouches[0].screenX;
				this.data.pagey.start = e.targetTouches[0].screenY;
			}
		} else {
			this.data.pagex.start = e.pageX;
			this.data.pagey.start = e.pageY;
		}
		
		// Center element to finger or mouse
		if (this.options.enable.x) {
			//this._el.move.style.left = this.data.pagex.start - (this._el.move.offsetWidth / 2) + "px";
		}
		
		if (this.options.enable.y) {
			//this._el.move.style.top = this.data.pagey.start - (this._el.move.offsetHeight / 2) + "px";
		}
		
		this.data.pos.start = {x:this._el.move.offsetLeft, y:this._el.move.offsetTop};
		
		
		this.data.time.start 			= new Date().getTime();
		
		this.fire("dragstart", this.data);
		_dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.addListener(this._el.drag, this.dragevent.move, this._onDragMove, this);
		_dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.addListener(this._el.drag, this.dragevent.leave, this._onDragEnd, this);
	}
	
	_onDragEnd(e) {
		this.data.sliding = false;
		_dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.removeListener(this._el.drag, this.dragevent.move, this._onDragMove, this);
		_dom_DOMEvent__WEBPACK_IMPORTED_MODULE_5__.DOMEvent.removeListener(this._el.drag, this.dragevent.leave, this._onDragEnd, this);
		this.fire("dragend", this.data);
		
		//  momentum
		this._momentum();
	}
	
	_onDragMove(e) {
		var change = {
			x:0,
			y:0
		}
		//e.preventDefault();
		this.data.sliding = true;
		
		if (_core_Browser__WEBPACK_IMPORTED_MODULE_4__.touch) {
			if (e.originalEvent) {
				this.data.pagex.end = e.originalEvent.touches[0].screenX;
				this.data.pagey.end = e.originalEvent.touches[0].screenY;
			} else {
				this.data.pagex.end = e.targetTouches[0].screenX;
				this.data.pagey.end = e.targetTouches[0].screenY;
			}

		} else {
			this.data.pagex.end = e.pageX;
			this.data.pagey.end = e.pageY;
		}
		
		change.x = this.data.pagex.start - this.data.pagex.end;
		change.y = this.data.pagey.start - this.data.pagey.end;
		
		this.data.pos.end = {x:this._el.drag.offsetLeft, y:this._el.drag.offsetTop};
		
		this.data.new_pos.x = -(change.x - this.data.pos.start.x);
		this.data.new_pos.y = -(change.y - this.data.pos.start.y );
		
		if (this.options.enable.x && ( Math.abs(change.x) > Math.abs(change.y) ) ) {
			e.preventDefault();
			this._el.move.style.left = this.data.new_pos.x + "px";
		}
		
		if (this.options.enable.y && ( Math.abs(change.y) > Math.abs(change.y) ) ) {
			e.preventDefault();
			this._el.move.style.top = this.data.new_pos.y + "px";
		}
		
		this.fire("dragmove", this.data);
	}
	
	_momentum() {
		var pos_adjust = {
				x: 0,
				y: 0,
				time: 0
			},
			pos_change = {
				x: 0,
				y: 0,
				time: 0
			},
			swipe_detect = {
				x: false,
				y: false
			},
			swipe = false,
			swipe_direction = "";
		
		
		this.data.direction = null;
		
		pos_adjust.time = (new Date().getTime() - this.data.time.start) * 10;
		pos_change.time = (new Date().getTime() - this.data.time.start) * 10;
		
		pos_change.x = this.options.momentum_multiplier * (Math.abs(this.data.pagex.end) - Math.abs(this.data.pagex.start));
		pos_change.y = this.options.momentum_multiplier * (Math.abs(this.data.pagey.end) - Math.abs(this.data.pagey.start));
		
		pos_adjust.x = Math.round(pos_change.x / pos_change.time);
		pos_adjust.y = Math.round(pos_change.y / pos_change.time);
		
		this.data.new_pos.x = Math.min(this.data.new_pos.x + pos_adjust.x);
		this.data.new_pos.y = Math.min(this.data.new_pos.y + pos_adjust.y);
		
		if (!this.options.enable.x) {
			this.data.new_pos.x = this.data.pos.start.x;
		} else if (this.options.constraint.left && this.data.new_pos.x > this.options.constraint.left) {
			this.data.new_pos.x = this.options.constraint.left;
		}
		
		if (!this.options.enable.y) {
			this.data.new_pos.y = this.data.pos.start.y;
		} else if (this.data.new_pos.y < 0) {
			this.data.new_pos.y = 0;
		}
		
		// Detect Swipe
		if (pos_change.time < 2000) {
			swipe = true;
		}
		
		
		if (this.options.enable.x && this.options.enable.y) {
			if (Math.abs(pos_change.x) > Math.abs(pos_change.y)) {
				swipe_detect.x = true;
			} else {
				swipe_detect.y = true;
			}
		} else if (this.options.enable.x) {
			if (Math.abs(pos_change.x) > Math.abs(pos_change.y)) {
				swipe_detect.x = true;
			}
		} else {
			if (Math.abs(pos_change.y) > Math.abs(pos_change.x)) {
				swipe_detect.y = true;
			}
		}
		
		// Detect Direction and long swipe
		if (swipe_detect.x) {
			
			// Long Swipe
			if (Math.abs(pos_change.x) > (this._el.drag.offsetWidth/2)) {
				swipe = true;
			}
			
			if (Math.abs(pos_change.x) > 10000) {
				this.data.direction = "left";
				if (pos_change.x > 0) {
					this.data.direction = "right";
				}
			}
		}
		
		if (swipe_detect.y) {
			
			// Long Swipe
			if (Math.abs(pos_change.y) > (this._el.drag.offsetHeight/2)) {
				swipe = true;
			}
			
			if (Math.abs(pos_change.y) > 10000) {
				this.data.direction = "up";
				if (pos_change.y > 0) {
					this.data.direction = "down";
				}
			}
		}
		
		if (pos_change.time < 1000 ) {
			
		} else {
			this._animateMomentum();
		}
		
		if (swipe && this.data.direction) {
			this.fire("swipe_" + this.data.direction, this.data);
		} else if (this.data.direction) {
			this.fire("swipe_nodirection", this.data);
		} else if (this.options.snap) {
			this.animator.stop();
			
			this.animator = (0,_animation_Animate__WEBPACK_IMPORTED_MODULE_3__.Animate)(this._el.move, {
				top: 		this.data.pos.start.y,
				left: 		this.data.pos.start.x,
				duration: 	this.options.duration,
				easing: 	_animation_Ease__WEBPACK_IMPORTED_MODULE_2__.easeOutStrong
			});
		}
		
	}
	
	
	_animateMomentum() {
		var pos = {
				x: this.data.new_pos.x,
				y: this.data.new_pos.y
			},
			animate = {
				duration: 	this.options.duration,
				easing: 	_animation_Ease__WEBPACK_IMPORTED_MODULE_2__.easeOutStrong
			};
		
		if (this.options.enable.y) {
			if (this.options.constraint.top || this.options.constraint.bottom) {
				if (pos.y > this.options.constraint.bottom) {
					pos.y = this.options.constraint.bottom;
				} else if (pos.y < this.options.constraint.top) {
					pos.y = this.options.constraint.top;
				}
			}
			animate.top = Math.floor(pos.y) + "px";
		}
		
		if (this.options.enable.x) {
			if (this.options.constraint.left && pos.x >= this.options.constraint.left) {
				pos.x = this.options.constraint.left;
			}
			if (this.options.constraint.right && pos.x < this.options.constraint.right) {
				pos.x = this.options.constraint.right;
			}

			animate.left = Math.floor(pos.x) + "px";
		}
		
		this.animator = (0,_animation_Animate__WEBPACK_IMPORTED_MODULE_3__.Animate)(this._el.move, animate);
		
		this.fire("momentum", this.data);
	}
}

(0,_core_Util__WEBPACK_IMPORTED_MODULE_0__.classMixin)(Swipable, _core_Events__WEBPACK_IMPORTED_MODULE_1__["default"])


/***/ }),

/***/ "./node_modules/dompurify/dist/purify.es.mjs":
/*!***************************************************!*\
  !*** ./node_modules/dompurify/dist/purify.es.mjs ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ purify)
/* harmony export */ });
/*! @license DOMPurify 3.2.4 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.4/LICENSE */

const {
  entries,
  setPrototypeOf,
  isFrozen,
  getPrototypeOf,
  getOwnPropertyDescriptor
} = Object;
let {
  freeze,
  seal,
  create
} = Object; // eslint-disable-line import/no-mutable-exports
let {
  apply,
  construct
} = typeof Reflect !== 'undefined' && Reflect;
if (!freeze) {
  freeze = function freeze(x) {
    return x;
  };
}
if (!seal) {
  seal = function seal(x) {
    return x;
  };
}
if (!apply) {
  apply = function apply(fun, thisValue, args) {
    return fun.apply(thisValue, args);
  };
}
if (!construct) {
  construct = function construct(Func, args) {
    return new Func(...args);
  };
}
const arrayForEach = unapply(Array.prototype.forEach);
const arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
const arrayPop = unapply(Array.prototype.pop);
const arrayPush = unapply(Array.prototype.push);
const arraySplice = unapply(Array.prototype.splice);
const stringToLowerCase = unapply(String.prototype.toLowerCase);
const stringToString = unapply(String.prototype.toString);
const stringMatch = unapply(String.prototype.match);
const stringReplace = unapply(String.prototype.replace);
const stringIndexOf = unapply(String.prototype.indexOf);
const stringTrim = unapply(String.prototype.trim);
const objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
const regExpTest = unapply(RegExp.prototype.test);
const typeErrorCreate = unconstruct(TypeError);
/**
 * Creates a new function that calls the given function with a specified thisArg and arguments.
 *
 * @param func - The function to be wrapped and called.
 * @returns A new function that calls the given function with a specified thisArg and arguments.
 */
function unapply(func) {
  return function (thisArg) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    return apply(func, thisArg, args);
  };
}
/**
 * Creates a new function that constructs an instance of the given constructor function with the provided arguments.
 *
 * @param func - The constructor function to be wrapped and called.
 * @returns A new function that constructs an instance of the given constructor function with the provided arguments.
 */
function unconstruct(func) {
  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    return construct(func, args);
  };
}
/**
 * Add properties to a lookup table
 *
 * @param set - The set to which elements will be added.
 * @param array - The array containing elements to be added to the set.
 * @param transformCaseFunc - An optional function to transform the case of each element before adding to the set.
 * @returns The modified set with added elements.
 */
function addToSet(set, array) {
  let transformCaseFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : stringToLowerCase;
  if (setPrototypeOf) {
    // Make 'in' and truthy checks like Boolean(set.constructor)
    // independent of any properties defined on Object.prototype.
    // Prevent prototype setters from intercepting set as a this value.
    setPrototypeOf(set, null);
  }
  let l = array.length;
  while (l--) {
    let element = array[l];
    if (typeof element === 'string') {
      const lcElement = transformCaseFunc(element);
      if (lcElement !== element) {
        // Config presets (e.g. tags.js, attrs.js) are immutable.
        if (!isFrozen(array)) {
          array[l] = lcElement;
        }
        element = lcElement;
      }
    }
    set[element] = true;
  }
  return set;
}
/**
 * Clean up an array to harden against CSPP
 *
 * @param array - The array to be cleaned.
 * @returns The cleaned version of the array
 */
function cleanArray(array) {
  for (let index = 0; index < array.length; index++) {
    const isPropertyExist = objectHasOwnProperty(array, index);
    if (!isPropertyExist) {
      array[index] = null;
    }
  }
  return array;
}
/**
 * Shallow clone an object
 *
 * @param object - The object to be cloned.
 * @returns A new object that copies the original.
 */
function clone(object) {
  const newObject = create(null);
  for (const [property, value] of entries(object)) {
    const isPropertyExist = objectHasOwnProperty(object, property);
    if (isPropertyExist) {
      if (Array.isArray(value)) {
        newObject[property] = cleanArray(value);
      } else if (value && typeof value === 'object' && value.constructor === Object) {
        newObject[property] = clone(value);
      } else {
        newObject[property] = value;
      }
    }
  }
  return newObject;
}
/**
 * This method automatically checks if the prop is function or getter and behaves accordingly.
 *
 * @param object - The object to look up the getter function in its prototype chain.
 * @param prop - The property name for which to find the getter function.
 * @returns The getter function found in the prototype chain or a fallback function.
 */
function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc) {
      if (desc.get) {
        return unapply(desc.get);
      }
      if (typeof desc.value === 'function') {
        return unapply(desc.value);
      }
    }
    object = getPrototypeOf(object);
  }
  function fallbackValue() {
    return null;
  }
  return fallbackValue;
}

const html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);
const svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
const svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);
// List of SVG elements that are disallowed by default.
// We still need to know them so that we can do namespace
// checks properly in case one wants to add them to
// allow-list.
const svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
const mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'mprescripts']);
// Similarly to SVG, we want to know all MathML elements,
// even those that we disallow by default.
const mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
const text = freeze(['#text']);

const html = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'popover', 'popovertarget', 'popovertargetaction', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'wrap', 'xmlns', 'slot']);
const svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'amplitude', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'exponent', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'intercept', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'slope', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'tablevalues', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
const mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
const xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

// eslint-disable-next-line unicorn/better-regex
const MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
const ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
const TMPLIT_EXPR = seal(/\$\{[\w\W]*/gm); // eslint-disable-line unicorn/better-regex
const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/); // eslint-disable-line no-useless-escape
const ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
const IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
);
const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
const ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
);
const DOCTYPE_NAME = seal(/^html$/i);
const CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);

var EXPRESSIONS = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ARIA_ATTR: ARIA_ATTR,
  ATTR_WHITESPACE: ATTR_WHITESPACE,
  CUSTOM_ELEMENT: CUSTOM_ELEMENT,
  DATA_ATTR: DATA_ATTR,
  DOCTYPE_NAME: DOCTYPE_NAME,
  ERB_EXPR: ERB_EXPR,
  IS_ALLOWED_URI: IS_ALLOWED_URI,
  IS_SCRIPT_OR_DATA: IS_SCRIPT_OR_DATA,
  MUSTACHE_EXPR: MUSTACHE_EXPR,
  TMPLIT_EXPR: TMPLIT_EXPR
});

/* eslint-disable @typescript-eslint/indent */
// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
const NODE_TYPE = {
  element: 1,
  attribute: 2,
  text: 3,
  cdataSection: 4,
  entityReference: 5,
  // Deprecated
  entityNode: 6,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9,
  documentType: 10,
  documentFragment: 11,
  notation: 12 // Deprecated
};
const getGlobal = function getGlobal() {
  return typeof window === 'undefined' ? null : window;
};
/**
 * Creates a no-op policy for internal use only.
 * Don't export this function outside this module!
 * @param trustedTypes The policy factory.
 * @param purifyHostElement The Script element used to load DOMPurify (to determine policy name suffix).
 * @return The policy created (or null, if Trusted Types
 * are not supported or creating the policy failed).
 */
const _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, purifyHostElement) {
  if (typeof trustedTypes !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
    return null;
  }
  // Allow the callers to control the unique policy name
  // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
  // Policy creation with duplicate names throws in Trusted Types.
  let suffix = null;
  const ATTR_NAME = 'data-tt-policy-suffix';
  if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
    suffix = purifyHostElement.getAttribute(ATTR_NAME);
  }
  const policyName = 'dompurify' + (suffix ? '#' + suffix : '');
  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML(html) {
        return html;
      },
      createScriptURL(scriptUrl) {
        return scriptUrl;
      }
    });
  } catch (_) {
    // Policy creation failed (most likely another DOMPurify script has
    // already run). Skip creating the policy, as this will only cause errors
    // if TT are enforced.
    console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
    return null;
  }
};
const _createHooksMap = function _createHooksMap() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
};
function createDOMPurify() {
  let window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();
  const DOMPurify = root => createDOMPurify(root);
  DOMPurify.version = '3.2.4';
  DOMPurify.removed = [];
  if (!window || !window.document || window.document.nodeType !== NODE_TYPE.document || !window.Element) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;
    return DOMPurify;
  }
  let {
    document
  } = window;
  const originalDocument = document;
  const currentScript = originalDocument.currentScript;
  const {
    DocumentFragment,
    HTMLTemplateElement,
    Node,
    Element,
    NodeFilter,
    NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap,
    HTMLFormElement,
    DOMParser,
    trustedTypes
  } = window;
  const ElementPrototype = Element.prototype;
  const cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
  const remove = lookupGetter(ElementPrototype, 'remove');
  const getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
  const getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
  const getParentNode = lookupGetter(ElementPrototype, 'parentNode');
  // As per issue #47, the web-components registry is inherited by a
  // new document created via createHTMLDocument. As per the spec
  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
  // a new empty registry is used when creating a template contents owner
  // document, so we use that as our parent document to ensure nothing
  // is inherited.
  if (typeof HTMLTemplateElement === 'function') {
    const template = document.createElement('template');
    if (template.content && template.content.ownerDocument) {
      document = template.content.ownerDocument;
    }
  }
  let trustedTypesPolicy;
  let emptyHTML = '';
  const {
    implementation,
    createNodeIterator,
    createDocumentFragment,
    getElementsByTagName
  } = document;
  const {
    importNode
  } = originalDocument;
  let hooks = _createHooksMap();
  /**
   * Expose whether this browser supports running the full DOMPurify.
   */
  DOMPurify.isSupported = typeof entries === 'function' && typeof getParentNode === 'function' && implementation && implementation.createHTMLDocument !== undefined;
  const {
    MUSTACHE_EXPR,
    ERB_EXPR,
    TMPLIT_EXPR,
    DATA_ATTR,
    ARIA_ATTR,
    IS_SCRIPT_OR_DATA,
    ATTR_WHITESPACE,
    CUSTOM_ELEMENT
  } = EXPRESSIONS;
  let {
    IS_ALLOWED_URI: IS_ALLOWED_URI$1
  } = EXPRESSIONS;
  /**
   * We consider the elements and attributes below to be safe. Ideally
   * don't add any new ones but feel free to remove unwanted ones.
   */
  /* allowed element names */
  let ALLOWED_TAGS = null;
  const DEFAULT_ALLOWED_TAGS = addToSet({}, [...html$1, ...svg$1, ...svgFilters, ...mathMl$1, ...text]);
  /* Allowed attribute names */
  let ALLOWED_ATTR = null;
  const DEFAULT_ALLOWED_ATTR = addToSet({}, [...html, ...svg, ...mathMl, ...xml]);
  /*
   * Configure how DOMPurify should handle custom elements and their attributes as well as customized built-in elements.
   * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
   * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
   * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
   */
  let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
    tagNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: false
    }
  }));
  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
  let FORBID_TAGS = null;
  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
  let FORBID_ATTR = null;
  /* Decide if ARIA attributes are okay */
  let ALLOW_ARIA_ATTR = true;
  /* Decide if custom data attributes are okay */
  let ALLOW_DATA_ATTR = true;
  /* Decide if unknown protocols are okay */
  let ALLOW_UNKNOWN_PROTOCOLS = false;
  /* Decide if self-closing tags in attributes are allowed.
   * Usually removed due to a mXSS issue in jQuery 3.0 */
  let ALLOW_SELF_CLOSE_IN_ATTR = true;
  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */
  let SAFE_FOR_TEMPLATES = false;
  /* Output should be safe even for XML used within HTML and alike.
   * This means, DOMPurify removes comments when containing risky content.
   */
  let SAFE_FOR_XML = true;
  /* Decide if document with <html>... should be returned */
  let WHOLE_DOCUMENT = false;
  /* Track whether config is already set on this instance of DOMPurify. */
  let SET_CONFIG = false;
  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */
  let FORCE_BODY = false;
  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
   * string (or a TrustedHTML object if Trusted Types are supported).
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */
  let RETURN_DOM = false;
  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
   * string  (or a TrustedHTML object if Trusted Types are supported) */
  let RETURN_DOM_FRAGMENT = false;
  /* Try to return a Trusted Type object instead of a string, return a string in
   * case Trusted Types are not supported  */
  let RETURN_TRUSTED_TYPE = false;
  /* Output should be free from DOM clobbering attacks?
   * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
   */
  let SANITIZE_DOM = true;
  /* Achieve full DOM Clobbering protection by isolating the namespace of named
   * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
   *
   * HTML/DOM spec rules that enable DOM Clobbering:
   *   - Named Access on Window (§7.3.3)
   *   - DOM Tree Accessors (§3.1.5)
   *   - Form Element Parent-Child Relations (§4.10.3)
   *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
   *   - HTMLCollection (§4.2.10.2)
   *
   * Namespace isolation is implemented by prefixing `id` and `name` attributes
   * with a constant string, i.e., `user-content-`
   */
  let SANITIZE_NAMED_PROPS = false;
  const SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';
  /* Keep element content when removing element? */
  let KEEP_CONTENT = true;
  /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
   * of importing it into a new Document and returning a sanitized copy */
  let IN_PLACE = false;
  /* Allow usage of profiles like html, svg and mathMl */
  let USE_PROFILES = {};
  /* Tags to ignore content of when KEEP_CONTENT is true */
  let FORBID_CONTENTS = null;
  const DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);
  /* Tags that are safe for data: URIs */
  let DATA_URI_TAGS = null;
  const DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);
  /* Attributes safe for values like "javascript:" */
  let URI_SAFE_ATTRIBUTES = null;
  const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
  const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
  /* Document namespace */
  let NAMESPACE = HTML_NAMESPACE;
  let IS_EMPTY_INPUT = false;
  /* Allowed XHTML+XML namespaces */
  let ALLOWED_NAMESPACES = null;
  const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);
  let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);
  let HTML_INTEGRATION_POINTS = addToSet({}, ['annotation-xml']);
  // Certain elements are allowed in both SVG and HTML
  // namespace. We need to specify them explicitly
  // so that they don't get erroneously deleted from
  // HTML namespace.
  const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);
  /* Parsing of strict XHTML documents */
  let PARSER_MEDIA_TYPE = null;
  const SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
  const DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
  let transformCaseFunc = null;
  /* Keep a reference to config to pass to hooks */
  let CONFIG = null;
  /* Ideally, do not touch anything below this line */
  /* ______________________________________________ */
  const formElement = document.createElement('form');
  const isRegexOrFunction = function isRegexOrFunction(testValue) {
    return testValue instanceof RegExp || testValue instanceof Function;
  };
  /**
   * _parseConfig
   *
   * @param cfg optional config literal
   */
  // eslint-disable-next-line complexity
  const _parseConfig = function _parseConfig() {
    let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (CONFIG && CONFIG === cfg) {
      return;
    }
    /* Shield configuration object from tampering */
    if (!cfg || typeof cfg !== 'object') {
      cfg = {};
    }
    /* Shield configuration object from prototype pollution */
    cfg = clone(cfg);
    PARSER_MEDIA_TYPE =
    // eslint-disable-next-line unicorn/prefer-includes
    SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
    // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.
    transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? stringToString : stringToLowerCase;
    /* Set configuration parameters */
    ALLOWED_TAGS = objectHasOwnProperty(cfg, 'ALLOWED_TAGS') ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR = objectHasOwnProperty(cfg, 'ALLOWED_ATTR') ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
    ALLOWED_NAMESPACES = objectHasOwnProperty(cfg, 'ALLOWED_NAMESPACES') ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
    URI_SAFE_ATTRIBUTES = objectHasOwnProperty(cfg, 'ADD_URI_SAFE_ATTR') ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR, transformCaseFunc) : DEFAULT_URI_SAFE_ATTRIBUTES;
    DATA_URI_TAGS = objectHasOwnProperty(cfg, 'ADD_DATA_URI_TAGS') ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS, transformCaseFunc) : DEFAULT_DATA_URI_TAGS;
    FORBID_CONTENTS = objectHasOwnProperty(cfg, 'FORBID_CONTENTS') ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
    FORBID_TAGS = objectHasOwnProperty(cfg, 'FORBID_TAGS') ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : {};
    FORBID_ATTR = objectHasOwnProperty(cfg, 'FORBID_ATTR') ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : {};
    USE_PROFILES = objectHasOwnProperty(cfg, 'USE_PROFILES') ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
    ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
    SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false; // Default true
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
    RETURN_DOM = cfg.RETURN_DOM || false; // Default false
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
    FORCE_BODY = cfg.FORCE_BODY || false; // Default false
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
    SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
    IN_PLACE = cfg.IN_PLACE || false; // Default false
    IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI;
    NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
    MATHML_TEXT_INTEGRATION_POINTS = cfg.MATHML_TEXT_INTEGRATION_POINTS || MATHML_TEXT_INTEGRATION_POINTS;
    HTML_INTEGRATION_POINTS = cfg.HTML_INTEGRATION_POINTS || HTML_INTEGRATION_POINTS;
    CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};
    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
    }
    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
    }
    if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === 'boolean') {
      CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
    }
    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }
    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }
    /* Parse profile info */
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, text);
      ALLOWED_ATTR = [];
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html$1);
        addToSet(ALLOWED_ATTR, html);
      }
      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg$1);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl$1);
        addToSet(ALLOWED_ATTR, mathMl);
        addToSet(ALLOWED_ATTR, xml);
      }
    }
    /* Merge configuration parameters */
    if (cfg.ADD_TAGS) {
      if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
        ALLOWED_TAGS = clone(ALLOWED_TAGS);
      }
      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
    }
    if (cfg.ADD_ATTR) {
      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
        ALLOWED_ATTR = clone(ALLOWED_ATTR);
      }
      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
    }
    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
    }
    if (cfg.FORBID_CONTENTS) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
        FORBID_CONTENTS = clone(FORBID_CONTENTS);
      }
      addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
    }
    /* Add #text in case KEEP_CONTENT is set to true */
    if (KEEP_CONTENT) {
      ALLOWED_TAGS['#text'] = true;
    }
    /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
    }
    /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ['tbody']);
      delete FORBID_TAGS.tbody;
    }
    if (cfg.TRUSTED_TYPES_POLICY) {
      if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== 'function') {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      }
      if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== 'function') {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      }
      // Overwrite existing TrustedTypes policy.
      trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
      // Sign local variables required by `sanitize`.
      emptyHTML = trustedTypesPolicy.createHTML('');
    } else {
      // Uninitialized policy, attempt to initialize the internal dompurify policy.
      if (trustedTypesPolicy === undefined) {
        trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
      }
      // If creating the internal policy succeeded sign internal variables.
      if (trustedTypesPolicy !== null && typeof emptyHTML === 'string') {
        emptyHTML = trustedTypesPolicy.createHTML('');
      }
    }
    // Prevent further manipulation of configuration.
    // Not available in IE8, Safari 5, etc.
    if (freeze) {
      freeze(cfg);
    }
    CONFIG = cfg;
  };
  /* Keep track of all possible SVG and MathML tags
   * so that we can perform the namespace checks
   * correctly. */
  const ALL_SVG_TAGS = addToSet({}, [...svg$1, ...svgFilters, ...svgDisallowed]);
  const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
  /**
   * @param element a DOM element whose namespace is being checked
   * @returns Return false if the element has a
   *  namespace that a spec-compliant parser would never
   *  return. Return true otherwise.
   */
  const _checkValidNamespace = function _checkValidNamespace(element) {
    let parent = getParentNode(element);
    // In JSDOM, if we're inside shadow DOM, then parentNode
    // can be null. We just simulate parent in this case.
    if (!parent || !parent.tagName) {
      parent = {
        namespaceURI: NAMESPACE,
        tagName: 'template'
      };
    }
    const tagName = stringToLowerCase(element.tagName);
    const parentTagName = stringToLowerCase(parent.tagName);
    if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
      return false;
    }
    if (element.namespaceURI === SVG_NAMESPACE) {
      // The only way to switch from HTML namespace to SVG
      // is via <svg>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'svg';
      }
      // The only way to switch from MathML to SVG is via`
      // svg if parent is either <annotation-xml> or MathML
      // text integration points.
      if (parent.namespaceURI === MATHML_NAMESPACE) {
        return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
      }
      // We only allow elements that are defined in SVG
      // spec. All others are disallowed in SVG namespace.
      return Boolean(ALL_SVG_TAGS[tagName]);
    }
    if (element.namespaceURI === MATHML_NAMESPACE) {
      // The only way to switch from HTML namespace to MathML
      // is via <math>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'math';
      }
      // The only way to switch from SVG to MathML is via
      // <math> and HTML integration points
      if (parent.namespaceURI === SVG_NAMESPACE) {
        return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
      }
      // We only allow elements that are defined in MathML
      // spec. All others are disallowed in MathML namespace.
      return Boolean(ALL_MATHML_TAGS[tagName]);
    }
    if (element.namespaceURI === HTML_NAMESPACE) {
      // The only way to switch from SVG to HTML is via
      // HTML integration points, and from MathML to HTML
      // is via MathML text integration points
      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }
      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }
      // We disallow tags that are specific for MathML
      // or SVG and should never appear in HTML namespace
      return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
    }
    // For XHTML and XML documents that support custom namespaces
    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && ALLOWED_NAMESPACES[element.namespaceURI]) {
      return true;
    }
    // The code should never reach this place (this means
    // that the element somehow got namespace that is not
    // HTML, SVG, MathML or allowed via ALLOWED_NAMESPACES).
    // Return false just in case.
    return false;
  };
  /**
   * _forceRemove
   *
   * @param node a DOM node
   */
  const _forceRemove = function _forceRemove(node) {
    arrayPush(DOMPurify.removed, {
      element: node
    });
    try {
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      getParentNode(node).removeChild(node);
    } catch (_) {
      remove(node);
    }
  };
  /**
   * _removeAttribute
   *
   * @param name an Attribute name
   * @param element a DOM node
   */
  const _removeAttribute = function _removeAttribute(name, element) {
    try {
      arrayPush(DOMPurify.removed, {
        attribute: element.getAttributeNode(name),
        from: element
      });
    } catch (_) {
      arrayPush(DOMPurify.removed, {
        attribute: null,
        from: element
      });
    }
    element.removeAttribute(name);
    // We void attribute values for unremovable "is" attributes
    if (name === 'is') {
      if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
        try {
          _forceRemove(element);
        } catch (_) {}
      } else {
        try {
          element.setAttribute(name, '');
        } catch (_) {}
      }
    }
  };
  /**
   * _initDocument
   *
   * @param dirty - a string of dirty markup
   * @return a DOM, filled with the dirty markup
   */
  const _initDocument = function _initDocument(dirty) {
    /* Create a HTML document */
    let doc = null;
    let leadingWhitespace = null;
    if (FORCE_BODY) {
      dirty = '<remove></remove>' + dirty;
    } else {
      /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
      const matches = stringMatch(dirty, /^[\r\n\t ]+/);
      leadingWhitespace = matches && matches[0];
    }
    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && NAMESPACE === HTML_NAMESPACE) {
      // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
      dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
    }
    const dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
    /*
     * Use the DOMParser API by default, fallback later if needs be
     * DOMParser not work for svg when has multiple root element.
     */
    if (NAMESPACE === HTML_NAMESPACE) {
      try {
        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
      } catch (_) {}
    }
    /* Use createHTMLDocument in case DOMParser is not available */
    if (!doc || !doc.documentElement) {
      doc = implementation.createDocument(NAMESPACE, 'template', null);
      try {
        doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
      } catch (_) {
        // Syntax error if dirtyPayload is invalid xml
      }
    }
    const body = doc.body || doc.documentElement;
    if (dirty && leadingWhitespace) {
      body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
    }
    /* Work on whole document or just its body */
    if (NAMESPACE === HTML_NAMESPACE) {
      return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
    }
    return WHOLE_DOCUMENT ? doc.documentElement : body;
  };
  /**
   * Creates a NodeIterator object that you can use to traverse filtered lists of nodes or elements in a document.
   *
   * @param root The root element or node to start traversing on.
   * @return The created NodeIterator
   */
  const _createNodeIterator = function _createNodeIterator(root) {
    return createNodeIterator.call(root.ownerDocument || root, root,
    // eslint-disable-next-line no-bitwise
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null);
  };
  /**
   * _isClobbered
   *
   * @param element element to check for clobbering attacks
   * @return true if clobbered, false if safe
   */
  const _isClobbered = function _isClobbered(element) {
    return element instanceof HTMLFormElement && (typeof element.nodeName !== 'string' || typeof element.textContent !== 'string' || typeof element.removeChild !== 'function' || !(element.attributes instanceof NamedNodeMap) || typeof element.removeAttribute !== 'function' || typeof element.setAttribute !== 'function' || typeof element.namespaceURI !== 'string' || typeof element.insertBefore !== 'function' || typeof element.hasChildNodes !== 'function');
  };
  /**
   * Checks whether the given object is a DOM node.
   *
   * @param value object to check whether it's a DOM node
   * @return true is object is a DOM node
   */
  const _isNode = function _isNode(value) {
    return typeof Node === 'function' && value instanceof Node;
  };
  function _executeHooks(hooks, currentNode, data) {
    arrayForEach(hooks, hook => {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  }
  /**
   * _sanitizeElements
   *
   * @protect nodeName
   * @protect textContent
   * @protect removeChild
   * @param currentNode to check for permission to exist
   * @return true if node was killed, false if left alive
   */
  const _sanitizeElements = function _sanitizeElements(currentNode) {
    let content = null;
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
    /* Check if element is clobbered or can clobber */
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Now let's check the element's type and name */
    const tagName = transformCaseFunc(currentNode.nodeName);
    /* Execute a hook if present */
    _executeHooks(hooks.uponSanitizeElement, currentNode, {
      tagName,
      allowedTags: ALLOWED_TAGS
    });
    /* Detect mXSS attempts abusing namespace confusion */
    if (currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Remove any occurrence of processing instructions */
    if (currentNode.nodeType === NODE_TYPE.progressingInstruction) {
      _forceRemove(currentNode);
      return true;
    }
    /* Remove any kind of possibly harmful comments */
    if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(/<[/\w]/g, currentNode.data)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Remove element if anything forbids its presence */
    if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
      /* Check if we have a custom element to handle */
      if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName)) {
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) {
          return false;
        }
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) {
          return false;
        }
      }
      /* Keep content except for bad-listed elements */
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
        const parentNode = getParentNode(currentNode) || currentNode.parentNode;
        const childNodes = getChildNodes(currentNode) || currentNode.childNodes;
        if (childNodes && parentNode) {
          const childCount = childNodes.length;
          for (let i = childCount - 1; i >= 0; --i) {
            const childClone = cloneNode(childNodes[i], true);
            childClone.__removalCount = (currentNode.__removalCount || 0) + 1;
            parentNode.insertBefore(childClone, getNextSibling(currentNode));
          }
        }
      }
      _forceRemove(currentNode);
      return true;
    }
    /* Check whether element has a valid namespace */
    if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Make sure that older browsers don't get fallback-tag mXSS */
    if ((tagName === 'noscript' || tagName === 'noembed' || tagName === 'noframes') && regExpTest(/<\/no(script|embed|frames)/i, currentNode.innerHTML)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Sanitize element content to be template-safe */
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
      /* Get the element's text content */
      content = currentNode.textContent;
      arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
        content = stringReplace(content, expr, ' ');
      });
      if (currentNode.textContent !== content) {
        arrayPush(DOMPurify.removed, {
          element: currentNode.cloneNode()
        });
        currentNode.textContent = content;
      }
    }
    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeElements, currentNode, null);
    return false;
  };
  /**
   * _isValidAttribute
   *
   * @param lcTag Lowercase tag name of containing element.
   * @param lcName Lowercase attribute name.
   * @param value Attribute value.
   * @return Returns true if `value` is valid, otherwise false.
   */
  // eslint-disable-next-line complexity
  const _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
    /* Make sure attribute cannot clobber */
    if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
      return false;
    }
    /* Allow valid data-* attributes: At least one character after "-"
        (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
        XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
        We don't need to check the value; it's always URI safe. */
    if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
      if (
      // First condition does a very basic check if a) it's basically a valid custom element tagname AND
      // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
      // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
      _isBasicCustomElement(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName)) ||
      // Alternative, second condition checks if it's an `is`-attribute, AND
      // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
      lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))) ; else {
        return false;
      }
      /* Check value is safe. First, is attr inert? If so, is safe */
    } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if (value) {
      return false;
    } else ;
    return true;
  };
  /**
   * _isBasicCustomElement
   * checks if at least one dash is included in tagName, and it's not the first char
   * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
   *
   * @param tagName name of the tag of the node to sanitize
   * @returns Returns true if the tag name meets the basic criteria for a custom element, otherwise false.
   */
  const _isBasicCustomElement = function _isBasicCustomElement(tagName) {
    return tagName !== 'annotation-xml' && stringMatch(tagName, CUSTOM_ELEMENT);
  };
  /**
   * _sanitizeAttributes
   *
   * @protect attributes
   * @protect nodeName
   * @protect removeAttribute
   * @protect setAttribute
   *
   * @param currentNode to sanitize
   */
  const _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
    const {
      attributes
    } = currentNode;
    /* Check if we have attributes; if not we might have a text node */
    if (!attributes || _isClobbered(currentNode)) {
      return;
    }
    const hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR,
      forceKeepAttr: undefined
    };
    let l = attributes.length;
    /* Go backwards over all attributes; safely remove bad ones */
    while (l--) {
      const attr = attributes[l];
      const {
        name,
        namespaceURI,
        value: attrValue
      } = attr;
      const lcName = transformCaseFunc(name);
      let value = name === 'value' ? attrValue : stringTrim(attrValue);
      /* Execute a hook if present */
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
      _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
      value = hookEvent.attrValue;
      /* Full DOM Clobbering protection via namespace isolation,
       * Prefix id and name attributes with `user-content-`
       */
      if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
        // Remove the attribute with this value
        _removeAttribute(name, currentNode);
        // Prefix the value and later re-create the attribute with the sanitized value
        value = SANITIZE_NAMED_PROPS_PREFIX + value;
      }
      /* Work around a security issue with comments inside attributes */
      if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|title)/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Did the hooks approve of the attribute? */
      if (hookEvent.forceKeepAttr) {
        continue;
      }
      /* Remove attribute */
      _removeAttribute(name, currentNode);
      /* Did the hooks approve of the attribute? */
      if (!hookEvent.keepAttr) {
        continue;
      }
      /* Work around a security issue in jQuery 3.0 */
      if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Sanitize attribute content to be template-safe */
      if (SAFE_FOR_TEMPLATES) {
        arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
          value = stringReplace(value, expr, ' ');
        });
      }
      /* Is `value` valid for this attribute? */
      const lcTag = transformCaseFunc(currentNode.nodeName);
      if (!_isValidAttribute(lcTag, lcName, value)) {
        continue;
      }
      /* Handle attributes that require Trusted Types */
      if (trustedTypesPolicy && typeof trustedTypes === 'object' && typeof trustedTypes.getAttributeType === 'function') {
        if (namespaceURI) ; else {
          switch (trustedTypes.getAttributeType(lcTag, lcName)) {
            case 'TrustedHTML':
              {
                value = trustedTypesPolicy.createHTML(value);
                break;
              }
            case 'TrustedScriptURL':
              {
                value = trustedTypesPolicy.createScriptURL(value);
                break;
              }
          }
        }
      }
      /* Handle invalid data-* attribute set by try-catching it */
      try {
        if (namespaceURI) {
          currentNode.setAttributeNS(namespaceURI, name, value);
        } else {
          /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
          currentNode.setAttribute(name, value);
        }
        if (_isClobbered(currentNode)) {
          _forceRemove(currentNode);
        } else {
          arrayPop(DOMPurify.removed);
        }
      } catch (_) {}
    }
    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
  };
  /**
   * _sanitizeShadowDOM
   *
   * @param fragment to iterate over recursively
   */
  const _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
    let shadowNode = null;
    const shadowIterator = _createNodeIterator(fragment);
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
    while (shadowNode = shadowIterator.nextNode()) {
      /* Execute a hook if present */
      _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
      /* Sanitize tags and elements */
      _sanitizeElements(shadowNode);
      /* Check attributes next */
      _sanitizeAttributes(shadowNode);
      /* Deep shadow DOM detected */
      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(shadowNode.content);
      }
    }
    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
  };
  // eslint-disable-next-line complexity
  DOMPurify.sanitize = function (dirty) {
    let cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let body = null;
    let importedNode = null;
    let currentNode = null;
    let returnNode = null;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */
    IS_EMPTY_INPUT = !dirty;
    if (IS_EMPTY_INPUT) {
      dirty = '<!-->';
    }
    /* Stringify, in case dirty is an object */
    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      if (typeof dirty.toString === 'function') {
        dirty = dirty.toString();
        if (typeof dirty !== 'string') {
          throw typeErrorCreate('dirty is not a string, aborting');
        }
      } else {
        throw typeErrorCreate('toString is not a function');
      }
    }
    /* Return dirty HTML if DOMPurify cannot run */
    if (!DOMPurify.isSupported) {
      return dirty;
    }
    /* Assign config vars */
    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }
    /* Clean up removed elements */
    DOMPurify.removed = [];
    /* Check if dirty is correctly typed for IN_PLACE */
    if (typeof dirty === 'string') {
      IN_PLACE = false;
    }
    if (IN_PLACE) {
      /* Do some early pre-sanitization to avoid unsafe root nodes */
      if (dirty.nodeName) {
        const tagName = transformCaseFunc(dirty.nodeName);
        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
        }
      }
    } else if (dirty instanceof Node) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument('<!---->');
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === 'BODY') {
        /* Node is already a body, use as is */
        body = importedNode;
      } else if (importedNode.nodeName === 'HTML') {
        body = importedNode;
      } else {
        // eslint-disable-next-line unicorn/prefer-dom-node-append
        body.appendChild(importedNode);
      }
    } else {
      /* Exit directly if we have nothing to do */
      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
      // eslint-disable-next-line unicorn/prefer-includes
      dirty.indexOf('<') === -1) {
        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
      }
      /* Initialize the document to work on */
      body = _initDocument(dirty);
      /* Check we have a DOM node from the data */
      if (!body) {
        return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
      }
    }
    /* Remove first element node (ours) if FORCE_BODY is set */
    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }
    /* Get node iterator */
    const nodeIterator = _createNodeIterator(IN_PLACE ? dirty : body);
    /* Now start iterating over the created document */
    while (currentNode = nodeIterator.nextNode()) {
      /* Sanitize tags and elements */
      _sanitizeElements(currentNode);
      /* Check attributes next */
      _sanitizeAttributes(currentNode);
      /* Shadow DOM detected, sanitize it */
      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }
    }
    /* If we sanitized `dirty` in-place, return it. */
    if (IN_PLACE) {
      return dirty;
    }
    /* Return sanitized string or DOM */
    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);
        while (body.firstChild) {
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }
      if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) {
        /*
          AdoptNode() is not used because internal state is not reset
          (e.g. the past names map of a HTMLFormElement), this is safe
          in theory but we would rather not risk another attack vector.
          The state that is cloned by importNode() is explicitly defined
          by the specs.
        */
        returnNode = importNode.call(originalDocument, returnNode, true);
      }
      return returnNode;
    }
    let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    /* Serialize doctype if allowed */
    if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
      serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
    }
    /* Sanitize final string template-safe */
    if (SAFE_FOR_TEMPLATES) {
      arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
        serializedHTML = stringReplace(serializedHTML, expr, ' ');
      });
    }
    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
  };
  DOMPurify.setConfig = function () {
    let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _parseConfig(cfg);
    SET_CONFIG = true;
  };
  DOMPurify.clearConfig = function () {
    CONFIG = null;
    SET_CONFIG = false;
  };
  DOMPurify.isValidAttribute = function (tag, attr, value) {
    /* Initialize shared config vars if necessary. */
    if (!CONFIG) {
      _parseConfig({});
    }
    const lcTag = transformCaseFunc(tag);
    const lcName = transformCaseFunc(attr);
    return _isValidAttribute(lcTag, lcName, value);
  };
  DOMPurify.addHook = function (entryPoint, hookFunction) {
    if (typeof hookFunction !== 'function') {
      return;
    }
    arrayPush(hooks[entryPoint], hookFunction);
  };
  DOMPurify.removeHook = function (entryPoint, hookFunction) {
    if (hookFunction !== undefined) {
      const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
      return index === -1 ? undefined : arraySplice(hooks[entryPoint], index, 1)[0];
    }
    return arrayPop(hooks[entryPoint]);
  };
  DOMPurify.removeHooks = function (entryPoint) {
    hooks[entryPoint] = [];
  };
  DOMPurify.removeAllHooks = function () {
    hooks = _createHooksMap();
  };
  return DOMPurify;
}
var purify = createDOMPurify();


//# sourceMappingURL=purify.es.mjs.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Timeline: () => (/* reexport safe */ _timeline_Timeline__WEBPACK_IMPORTED_MODULE_1__.Timeline),
/* harmony export */   exportJSON: () => (/* reexport safe */ _timeline_Timeline__WEBPACK_IMPORTED_MODULE_1__.exportJSON),
/* harmony export */   lookupMediaType: () => (/* reexport safe */ _media_MediaType__WEBPACK_IMPORTED_MODULE_3__.lookupMediaType),
/* harmony export */   parseGoogleSpreadsheetURL: () => (/* reexport safe */ _core_ConfigFactory__WEBPACK_IMPORTED_MODULE_2__.parseGoogleSpreadsheetURL)
/* harmony export */ });
/* harmony import */ var _less_TL_Timeline_less__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../less/TL.Timeline.less */ "./src/less/TL.Timeline.less");
/* harmony import */ var _timeline_Timeline__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./timeline/Timeline */ "./src/js/timeline/Timeline.js");
/* harmony import */ var _core_ConfigFactory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/ConfigFactory */ "./src/js/core/ConfigFactory.js");
/* harmony import */ var _media_MediaType__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./media/MediaType */ "./src/js/media/MediaType.js");





})();

TL = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=timeline.js.map