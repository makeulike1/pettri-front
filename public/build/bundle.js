
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.50.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const isUndefined = value => typeof value === "undefined";

    const isFunction = value => typeof value === "function";

    const isNumber = value => typeof value === "number";

    function createCounter() {
    	let i = 0;
    	/**
    	 * Returns an id and increments the internal state
    	 * @returns {number}
    	 */
    	return () => i++;
    }

    /**
     * Create a globally unique id
     *
     * @returns {string} An id
     */
    function createGlobalId() {
    	return Math.random().toString(36).substring(2);
    }

    const isSSR = typeof window === "undefined";

    function addListener(target, type, handler) {
    	target.addEventListener(type, handler);
    	return () => target.removeEventListener(type, handler);
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /*
     * Adapted from https://github.com/EmilTholin/svelte-routing
     *
     * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
     */

    const createKey = ctxName => `@@svnav-ctx__${ctxName}`;

    // Use strings instead of objects, so different versions of
    // svelte-navigator can potentially still work together
    const LOCATION = createKey("LOCATION");
    const ROUTER = createKey("ROUTER");
    const ROUTE = createKey("ROUTE");
    const ROUTE_PARAMS = createKey("ROUTE_PARAMS");
    const FOCUS_ELEM = createKey("FOCUS_ELEM");

    const paramRegex = /^:(.+)/;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    const startsWith = (string, search) =>
    	string.substr(0, search.length) === search;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    const isRootSegment = segment => segment === "";

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    const isDynamic = segment => paramRegex.test(segment);

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    const isSplat = segment => segment[0] === "*";

    /**
     * Strip potention splat and splatname of the end of a path
     * @param {string} str
     * @return {string}
     */
    const stripSplat = str => str.replace(/\*.*$/, "");

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    const stripSlashes = str => str.replace(/(^\/+|\/+$)/g, "");

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri, filterFalsy = false) {
    	const segments = stripSlashes(uri).split("/");
    	return filterFalsy ? segments.filter(Boolean) : segments;
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    const addQuery = (pathname, query) =>
    	pathname + (query ? `?${query}` : "");

    /**
     * Normalizes a basepath
     *
     * @param {string} path
     * @returns {string}
     *
     * @example
     * normalizePath("base/path/") // -> "/base/path"
     */
    const normalizePath = path => `/${stripSlashes(path)}`;

    /**
     * Joins and normalizes multiple path fragments
     *
     * @param {...string} pathFragments
     * @returns {string}
     */
    function join(...pathFragments) {
    	const joinFragment = fragment => segmentize(fragment, true).join("/");
    	const joinedSegments = pathFragments.map(joinFragment).join("/");
    	return normalizePath(joinedSegments);
    }

    // We start from 1 here, so we can check if an origin id has been passed
    // by using `originId || <fallback>`
    const LINK_ID = 1;
    const ROUTE_ID = 2;
    const ROUTER_ID = 3;
    const USE_FOCUS_ID = 4;
    const USE_LOCATION_ID = 5;
    const USE_MATCH_ID = 6;
    const USE_NAVIGATE_ID = 7;
    const USE_PARAMS_ID = 8;
    const USE_RESOLVABLE_ID = 9;
    const USE_RESOLVE_ID = 10;
    const NAVIGATE_ID = 11;

    const labels = {
    	[LINK_ID]: "Link",
    	[ROUTE_ID]: "Route",
    	[ROUTER_ID]: "Router",
    	[USE_FOCUS_ID]: "useFocus",
    	[USE_LOCATION_ID]: "useLocation",
    	[USE_MATCH_ID]: "useMatch",
    	[USE_NAVIGATE_ID]: "useNavigate",
    	[USE_PARAMS_ID]: "useParams",
    	[USE_RESOLVABLE_ID]: "useResolvable",
    	[USE_RESOLVE_ID]: "useResolve",
    	[NAVIGATE_ID]: "navigate",
    };

    const createLabel = labelId => labels[labelId];

    function createIdentifier(labelId, props) {
    	let attr;
    	if (labelId === ROUTE_ID) {
    		attr = props.path ? `path="${props.path}"` : "default";
    	} else if (labelId === LINK_ID) {
    		attr = `to="${props.to}"`;
    	} else if (labelId === ROUTER_ID) {
    		attr = `basepath="${props.basepath || ""}"`;
    	}
    	return `<${createLabel(labelId)} ${attr || ""} />`;
    }

    function createMessage(labelId, message, props, originId) {
    	const origin = props && createIdentifier(originId || labelId, props);
    	const originMsg = origin ? `\n\nOccurred in: ${origin}` : "";
    	const label = createLabel(labelId);
    	const msg = isFunction(message) ? message(label) : message;
    	return `<${label}> ${msg}${originMsg}`;
    }

    const createMessageHandler = handler => (...args) =>
    	handler(createMessage(...args));

    const fail = createMessageHandler(message => {
    	throw new Error(message);
    });

    // eslint-disable-next-line no-console
    const warn = createMessageHandler(console.warn);

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
    	const score = route.default
    		? 0
    		: segmentize(route.fullPath).reduce((acc, segment) => {
    				let nextScore = acc;
    				nextScore += SEGMENT_POINTS;

    				if (isRootSegment(segment)) {
    					nextScore += ROOT_POINTS;
    				} else if (isDynamic(segment)) {
    					nextScore += DYNAMIC_POINTS;
    				} else if (isSplat(segment)) {
    					nextScore -= SEGMENT_POINTS + SPLAT_PENALTY;
    				} else {
    					nextScore += STATIC_POINTS;
    				}

    				return nextScore;
    		  }, 0);

    	return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
    	return (
    		routes
    			.map(rankRoute)
    			// If two routes have the exact same score, we go by index instead
    			.sort((a, b) => {
    				if (a.score < b.score) {
    					return 1;
    				}
    				if (a.score > b.score) {
    					return -1;
    				}
    				return a.index - b.index;
    			})
    	);
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { fullPath, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
    	let bestMatch;
    	let defaultMatch;

    	const [uriPathname] = uri.split("?");
    	const uriSegments = segmentize(uriPathname);
    	const isRootUri = uriSegments[0] === "";
    	const ranked = rankRoutes(routes);

    	for (let i = 0, l = ranked.length; i < l; i++) {
    		const { route } = ranked[i];
    		let missed = false;
    		const params = {};

    		// eslint-disable-next-line no-shadow
    		const createMatch = uri => ({ ...route, params, uri });

    		if (route.default) {
    			defaultMatch = createMatch(uri);
    			continue;
    		}

    		const routeSegments = segmentize(route.fullPath);
    		const max = Math.max(uriSegments.length, routeSegments.length);
    		let index = 0;

    		for (; index < max; index++) {
    			const routeSegment = routeSegments[index];
    			const uriSegment = uriSegments[index];

    			if (!isUndefined(routeSegment) && isSplat(routeSegment)) {
    				// Hit a splat, just grab the rest, and return a match
    				// uri:   /files/documents/work
    				// route: /files/* or /files/*splatname
    				const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

    				params[splatName] = uriSegments
    					.slice(index)
    					.map(decodeURIComponent)
    					.join("/");
    				break;
    			}

    			if (isUndefined(uriSegment)) {
    				// URI is shorter than the route, no match
    				// uri:   /users
    				// route: /users/:userId
    				missed = true;
    				break;
    			}

    			const dynamicMatch = paramRegex.exec(routeSegment);

    			if (dynamicMatch && !isRootUri) {
    				const value = decodeURIComponent(uriSegment);
    				params[dynamicMatch[1]] = value;
    			} else if (routeSegment !== uriSegment) {
    				// Current segments don't match, not dynamic, not splat, so no match
    				// uri:   /users/123/settings
    				// route: /users/:id/profile
    				missed = true;
    				break;
    			}
    		}

    		if (!missed) {
    			bestMatch = createMatch(join(...uriSegments.slice(0, index)));
    			break;
    		}
    	}

    	return bestMatch || defaultMatch || null;
    }

    /**
     * Check if the `route.fullPath` matches the `uri`.
     * @param {Object} route
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
    	return pick([route], uri);
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
    	// /foo/bar, /baz/qux => /foo/bar
    	if (startsWith(to, "/")) {
    		return to;
    	}

    	const [toPathname, toQuery] = to.split("?");
    	const [basePathname] = base.split("?");
    	const toSegments = segmentize(toPathname);
    	const baseSegments = segmentize(basePathname);

    	// ?a=b, /users?b=c => /users?a=b
    	if (toSegments[0] === "") {
    		return addQuery(basePathname, toQuery);
    	}

    	// profile, /users/789 => /users/789/profile
    	if (!startsWith(toSegments[0], ".")) {
    		const pathname = baseSegments.concat(toSegments).join("/");
    		return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
    	}

    	// ./       , /users/123 => /users/123
    	// ../      , /users/123 => /users
    	// ../..    , /users/123 => /
    	// ../../one, /a/b/c/d   => /a/b/one
    	// .././one , /a/b/c/d   => /a/b/c/one
    	const allSegments = baseSegments.concat(toSegments);
    	const segments = [];

    	allSegments.forEach(segment => {
    		if (segment === "..") {
    			segments.pop();
    		} else if (segment !== ".") {
    			segments.push(segment);
    		}
    	});

    	return addQuery(`/${segments.join("/")}`, toQuery);
    }

    /**
     * Normalizes a location for consumption by `Route` children and the `Router`.
     * It removes the apps basepath from the pathname
     * and sets default values for `search` and `hash` properties.
     *
     * @param {Object} location The current global location supplied by the history component
     * @param {string} basepath The applications basepath (i.e. when serving from a subdirectory)
     *
     * @returns The normalized location
     */
    function normalizeLocation(location, basepath) {
    	const { pathname, hash = "", search = "", state } = location;
    	const baseSegments = segmentize(basepath, true);
    	const pathSegments = segmentize(pathname, true);
    	while (baseSegments.length) {
    		if (baseSegments[0] !== pathSegments[0]) {
    			fail(
    				ROUTER_ID,
    				`Invalid state: All locations must begin with the basepath "${basepath}", found "${pathname}"`,
    			);
    		}
    		baseSegments.shift();
    		pathSegments.shift();
    	}
    	return {
    		pathname: join(...pathSegments),
    		hash,
    		search,
    		state,
    	};
    }

    const normalizeUrlFragment = frag => (frag.length === 1 ? "" : frag);

    /**
     * Creates a location object from an url.
     * It is used to create a location from the url prop used in SSR
     *
     * @param {string} url The url string (e.g. "/path/to/somewhere")
     *
     * @returns {{ pathname: string; search: string; hash: string }} The location
     */
    function createLocation(url) {
    	const searchIndex = url.indexOf("?");
    	const hashIndex = url.indexOf("#");
    	const hasSearchIndex = searchIndex !== -1;
    	const hasHashIndex = hashIndex !== -1;
    	const hash = hasHashIndex ? normalizeUrlFragment(url.substr(hashIndex)) : "";
    	const pathnameAndSearch = hasHashIndex ? url.substr(0, hashIndex) : url;
    	const search = hasSearchIndex
    		? normalizeUrlFragment(pathnameAndSearch.substr(searchIndex))
    		: "";
    	const pathname = hasSearchIndex
    		? pathnameAndSearch.substr(0, searchIndex)
    		: pathnameAndSearch;
    	return { pathname, search, hash };
    }

    /**
     * Resolves a link relative to the parent Route and the Routers basepath.
     *
     * @param {string} path The given path, that will be resolved
     * @param {string} routeBase The current Routes base path
     * @param {string} appBase The basepath of the app. Used, when serving from a subdirectory
     * @returns {string} The resolved path
     *
     * @example
     * resolveLink("relative", "/routeBase", "/") // -> "/routeBase/relative"
     * resolveLink("/absolute", "/routeBase", "/") // -> "/absolute"
     * resolveLink("relative", "/routeBase", "/base") // -> "/base/routeBase/relative"
     * resolveLink("/absolute", "/routeBase", "/base") // -> "/base/absolute"
     */
    function resolveLink(path, routeBase, appBase) {
    	return join(appBase, resolve(path, routeBase));
    }

    /**
     * Get the uri for a Route, by matching it against the current location.
     *
     * @param {string} routePath The Routes resolved path
     * @param {string} pathname The current locations pathname
     */
    function extractBaseUri(routePath, pathname) {
    	const fullPath = normalizePath(stripSplat(routePath));
    	const baseSegments = segmentize(fullPath, true);
    	const pathSegments = segmentize(pathname, true).slice(0, baseSegments.length);
    	const routeMatch = match({ fullPath }, join(...pathSegments));
    	return routeMatch && routeMatch.uri;
    }

    /*
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const POP = "POP";
    const PUSH = "PUSH";
    const REPLACE = "REPLACE";

    function getLocation(source) {
    	return {
    		...source.location,
    		pathname: encodeURI(decodeURI(source.location.pathname)),
    		state: source.history.state,
    		_key: (source.history.state && source.history.state._key) || "initial",
    	};
    }

    function createHistory(source) {
    	let listeners = [];
    	let location = getLocation(source);
    	let action = POP;

    	const notifyListeners = (listenerFns = listeners) =>
    		listenerFns.forEach(listener => listener({ location, action }));

    	return {
    		get location() {
    			return location;
    		},
    		listen(listener) {
    			listeners.push(listener);

    			const popstateListener = () => {
    				location = getLocation(source);
    				action = POP;
    				notifyListeners([listener]);
    			};

    			// Call listener when it is registered
    			notifyListeners([listener]);

    			const unlisten = addListener(source, "popstate", popstateListener);
    			return () => {
    				unlisten();
    				listeners = listeners.filter(fn => fn !== listener);
    			};
    		},
    		/**
    		 * Navigate to a new absolute route.
    		 *
    		 * @param {string|number} to The path to navigate to.
    		 *
    		 * If `to` is a number we will navigate to the stack entry index + `to`
    		 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
    		 * @param {Object} options
    		 * @param {*} [options.state] The state will be accessible through `location.state`
    		 * @param {boolean} [options.replace=false] Replace the current entry in the history
    		 * stack, instead of pushing on a new one
    		 */
    		navigate(to, options) {
    			const { state = {}, replace = false } = options || {};
    			action = replace ? REPLACE : PUSH;
    			if (isNumber(to)) {
    				if (options) {
    					warn(
    						NAVIGATE_ID,
    						"Navigation options (state or replace) are not supported, " +
    							"when passing a number as the first argument to navigate. " +
    							"They are ignored.",
    					);
    				}
    				action = POP;
    				source.history.go(to);
    			} else {
    				const keyedState = { ...state, _key: createGlobalId() };
    				// try...catch iOS Safari limits to 100 pushState calls
    				try {
    					source.history[replace ? "replaceState" : "pushState"](
    						keyedState,
    						"",
    						to,
    					);
    				} catch (e) {
    					source.location[replace ? "replace" : "assign"](to);
    				}
    			}

    			location = getLocation(source);
    			notifyListeners();
    		},
    	};
    }

    function createStackFrame(state, uri) {
    	return { ...createLocation(uri), state };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
    	let index = 0;
    	let stack = [createStackFrame(null, initialPathname)];

    	return {
    		// This is just for testing...
    		get entries() {
    			return stack;
    		},
    		get location() {
    			return stack[index];
    		},
    		addEventListener() {},
    		removeEventListener() {},
    		history: {
    			get state() {
    				return stack[index].state;
    			},
    			pushState(state, title, uri) {
    				index++;
    				// Throw away anything in the stack with an index greater than the current index.
    				// This happens, when we go back using `go(-n)`. The index is now less than `stack.length`.
    				// If we call `go(+n)` the stack entries with an index greater than the current index can
    				// be reused.
    				// However, if we navigate to a path, instead of a number, we want to create a new branch
    				// of navigation.
    				stack = stack.slice(0, index);
    				stack.push(createStackFrame(state, uri));
    			},
    			replaceState(state, title, uri) {
    				stack[index] = createStackFrame(state, uri);
    			},
    			go(to) {
    				const newIndex = index + to;
    				if (newIndex < 0 || newIndex > stack.length - 1) {
    					return;
    				}
    				index = newIndex;
    			},
    		},
    	};
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = !!(
    	!isSSR &&
    	window.document &&
    	window.document.createElement
    );
    // Use memory history in iframes (for example in Svelte REPL)
    const isEmbeddedPage = !isSSR && window.location.origin === "null";
    const globalHistory = createHistory(
    	canUseDOM && !isEmbeddedPage ? window : createMemorySource(),
    );

    // We need to keep the focus candidate in a separate file, so svelte does
    // not update, when we mutate it.
    // Also, we need a single global reference, because taking focus needs to
    // work globally, even if we have multiple top level routers
    // eslint-disable-next-line import/no-mutable-exports
    let focusCandidate = null;

    // eslint-disable-next-line import/no-mutable-exports
    let initialNavigation = true;

    /**
     * Check if RouterA is above RouterB in the document
     * @param {number} routerIdA The first Routers id
     * @param {number} routerIdB The second Routers id
     */
    function isAbove(routerIdA, routerIdB) {
    	const routerMarkers = document.querySelectorAll("[data-svnav-router]");
    	for (let i = 0; i < routerMarkers.length; i++) {
    		const node = routerMarkers[i];
    		const currentId = Number(node.dataset.svnavRouter);
    		if (currentId === routerIdA) return true;
    		if (currentId === routerIdB) return false;
    	}
    	return false;
    }

    /**
     * Check if a Route candidate is the best choice to move focus to,
     * and store the best match.
     * @param {{
         level: number;
         routerId: number;
         route: {
           id: number;
           focusElement: import("svelte/store").Readable<Promise<Element>|null>;
         }
       }} item A Route candidate, that updated and is visible after a navigation
     */
    function pushFocusCandidate(item) {
    	if (
    		// Best candidate if it's the only candidate...
    		!focusCandidate ||
    		// Route is nested deeper, than previous candidate
    		// -> Route change was triggered in the deepest affected
    		// Route, so that's were focus should move to
    		item.level > focusCandidate.level ||
    		// If the level is identical, we want to focus the first Route in the document,
    		// so we pick the first Router lookin from page top to page bottom.
    		(item.level === focusCandidate.level &&
    			isAbove(item.routerId, focusCandidate.routerId))
    	) {
    		focusCandidate = item;
    	}
    }

    /**
     * Reset the focus candidate.
     */
    function clearFocusCandidate() {
    	focusCandidate = null;
    }

    function initialNavigationOccurred() {
    	initialNavigation = false;
    }

    /*
     * `focus` Adapted from https://github.com/oaf-project/oaf-side-effects/blob/master/src/index.ts
     *
     * https://github.com/oaf-project/oaf-side-effects/blob/master/LICENSE
     */
    function focus(elem) {
    	if (!elem) return false;
    	const TABINDEX = "tabindex";
    	try {
    		if (!elem.hasAttribute(TABINDEX)) {
    			elem.setAttribute(TABINDEX, "-1");
    			let unlisten;
    			// We remove tabindex after blur to avoid weird browser behavior
    			// where a mouse click can activate elements with tabindex="-1".
    			const blurListener = () => {
    				elem.removeAttribute(TABINDEX);
    				unlisten();
    			};
    			unlisten = addListener(elem, "blur", blurListener);
    		}
    		elem.focus();
    		return document.activeElement === elem;
    	} catch (e) {
    		// Apparently trying to focus a disabled element in IE can throw.
    		// See https://stackoverflow.com/a/1600194/2476884
    		return false;
    	}
    }

    function isEndMarker(elem, id) {
    	return Number(elem.dataset.svnavRouteEnd) === id;
    }

    function isHeading(elem) {
    	return /^H[1-6]$/i.test(elem.tagName);
    }

    function query(selector, parent = document) {
    	return parent.querySelector(selector);
    }

    function queryHeading(id) {
    	const marker = query(`[data-svnav-route-start="${id}"]`);
    	let current = marker.nextElementSibling;
    	while (!isEndMarker(current, id)) {
    		if (isHeading(current)) {
    			return current;
    		}
    		const heading = query("h1,h2,h3,h4,h5,h6", current);
    		if (heading) {
    			return heading;
    		}
    		current = current.nextElementSibling;
    	}
    	return null;
    }

    function handleFocus(route) {
    	Promise.resolve(get_store_value(route.focusElement)).then(elem => {
    		const focusElement = elem || queryHeading(route.id);
    		if (!focusElement) {
    			warn(
    				ROUTER_ID,
    				"Could not find an element to focus. " +
    					"You should always render a header for accessibility reasons, " +
    					'or set a custom focus element via the "useFocus" hook. ' +
    					"If you don't want this Route or Router to manage focus, " +
    					'pass "primary={false}" to it.',
    				route,
    				ROUTE_ID,
    			);
    		}
    		const headingFocused = focus(focusElement);
    		if (headingFocused) return;
    		focus(document.documentElement);
    	});
    }

    const createTriggerFocus = (a11yConfig, announcementText, location) => (
    	manageFocus,
    	announceNavigation,
    ) =>
    	// Wait until the dom is updated, so we can look for headings
    	tick().then(() => {
    		if (!focusCandidate || initialNavigation) {
    			initialNavigationOccurred();
    			return;
    		}
    		if (manageFocus) {
    			handleFocus(focusCandidate.route);
    		}
    		if (a11yConfig.announcements && announceNavigation) {
    			const { path, fullPath, meta, params, uri } = focusCandidate.route;
    			const announcementMessage = a11yConfig.createAnnouncement(
    				{ path, fullPath, meta, params, uri },
    				get_store_value(location),
    			);
    			Promise.resolve(announcementMessage).then(message => {
    				announcementText.set(message);
    			});
    		}
    		clearFocusCandidate();
    	});

    const visuallyHiddenStyle =
    	"position:fixed;" +
    	"top:-1px;" +
    	"left:0;" +
    	"width:1px;" +
    	"height:1px;" +
    	"padding:0;" +
    	"overflow:hidden;" +
    	"clip:rect(0,0,0,0);" +
    	"white-space:nowrap;" +
    	"border:0;";

    /* node_modules/svelte-navigator/src/Router.svelte generated by Svelte v3.50.0 */

    const file$9 = "node_modules/svelte-navigator/src/Router.svelte";

    // (195:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}
    function create_if_block$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*$announcementText*/ ctx[0]);
    			attr_dev(div, "role", "status");
    			attr_dev(div, "aria-atomic", "true");
    			attr_dev(div, "aria-live", "polite");
    			attr_dev(div, "style", visuallyHiddenStyle);
    			add_location(div, file$9, 195, 1, 5906);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$announcementText*/ 1) set_data_dev(t, /*$announcementText*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(195:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block_anchor;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);
    	let if_block = /*isTopLevelRouter*/ ctx[2] && /*manageFocus*/ ctx[4] && /*a11yConfig*/ ctx[1].announcements && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			set_style(div, "display", "none");
    			attr_dev(div, "aria-hidden", "true");
    			attr_dev(div, "data-svnav-router", /*routerId*/ ctx[3]);
    			add_location(div, file$9, 190, 0, 5750);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t0, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 524288)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*isTopLevelRouter*/ ctx[2] && /*manageFocus*/ ctx[4] && /*a11yConfig*/ ctx[1].announcements) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t0);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const createId$1 = createCounter();
    const defaultBasepath = "/";

    function instance$9($$self, $$props, $$invalidate) {
    	let $location;
    	let $activeRoute;
    	let $prevLocation;
    	let $routes;
    	let $announcementText;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = defaultBasepath } = $$props;
    	let { url = null } = $$props;
    	let { history = globalHistory } = $$props;
    	let { primary = true } = $$props;
    	let { a11y = {} } = $$props;

    	const a11yConfig = {
    		createAnnouncement: route => `Navigated to ${route.uri}`,
    		announcements: true,
    		...a11y
    	};

    	// Remember the initial `basepath`, so we can fire a warning
    	// when the user changes it later
    	const initialBasepath = basepath;

    	const normalizedBasepath = normalizePath(basepath);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const isTopLevelRouter = !locationContext;
    	const routerId = createId$1();
    	const manageFocus = primary && !(routerContext && !routerContext.manageFocus);
    	const announcementText = writable("");
    	validate_store(announcementText, 'announcementText');
    	component_subscribe($$self, announcementText, value => $$invalidate(0, $announcementText = value));
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(18, $routes = value));
    	const activeRoute = writable(null);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(16, $activeRoute = value));

    	// Used in SSR to synchronously set that a Route is active.
    	let hasActiveRoute = false;

    	// Nesting level of router.
    	// We will need this to identify sibling routers, when moving
    	// focus on navigation, so we can focus the first possible router
    	const level = isTopLevelRouter ? 0 : routerContext.level + 1;

    	// If we're running an SSR we force the location to the `url` prop
    	const getInitialLocation = () => normalizeLocation(isSSR ? createLocation(url) : history.location, normalizedBasepath);

    	const location = isTopLevelRouter
    	? writable(getInitialLocation())
    	: locationContext;

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(15, $location = value));
    	const prevLocation = writable($location);
    	validate_store(prevLocation, 'prevLocation');
    	component_subscribe($$self, prevLocation, value => $$invalidate(17, $prevLocation = value));
    	const triggerFocus = createTriggerFocus(a11yConfig, announcementText, location);
    	const createRouteFilter = routeId => routeList => routeList.filter(routeItem => routeItem.id !== routeId);

    	function registerRoute(route) {
    		if (isSSR) {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				hasActiveRoute = true;

    				// Return the match in SSR mode, so the matched Route can use it immediatly.
    				// Waiting for activeRoute to update does not work, because it updates
    				// after the Route is initialized
    				return matchingRoute; // eslint-disable-line consistent-return
    			}
    		} else {
    			routes.update(prevRoutes => {
    				// Remove an old version of the updated route,
    				// before pushing the new version
    				const nextRoutes = createRouteFilter(route.id)(prevRoutes);

    				nextRoutes.push(route);
    				return nextRoutes;
    			});
    		}
    	}

    	function unregisterRoute(routeId) {
    		routes.update(createRouteFilter(routeId));
    	}

    	if (!isTopLevelRouter && basepath !== defaultBasepath) {
    		warn(ROUTER_ID, 'Only top-level Routers can have a "basepath" prop. It is ignored.', { basepath });
    	}

    	if (isTopLevelRouter) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(changedHistory => {
    				const normalizedLocation = normalizeLocation(changedHistory.location, normalizedBasepath);
    				prevLocation.set($location);
    				location.set(normalizedLocation);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		registerRoute,
    		unregisterRoute,
    		manageFocus,
    		level,
    		id: routerId,
    		history: isTopLevelRouter ? history : routerContext.history,
    		basepath: isTopLevelRouter
    		? normalizedBasepath
    		: routerContext.basepath
    	});

    	const writable_props = ['basepath', 'url', 'history', 'primary', 'a11y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(10, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(11, url = $$props.url);
    		if ('history' in $$props) $$invalidate(12, history = $$props.history);
    		if ('primary' in $$props) $$invalidate(13, primary = $$props.primary);
    		if ('a11y' in $$props) $$invalidate(14, a11y = $$props.a11y);
    		if ('$$scope' in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createCounter,
    		createId: createId$1,
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		normalizePath,
    		pick,
    		match,
    		normalizeLocation,
    		createLocation,
    		isSSR,
    		warn,
    		ROUTER_ID,
    		pushFocusCandidate,
    		visuallyHiddenStyle,
    		createTriggerFocus,
    		defaultBasepath,
    		basepath,
    		url,
    		history,
    		primary,
    		a11y,
    		a11yConfig,
    		initialBasepath,
    		normalizedBasepath,
    		locationContext,
    		routerContext,
    		isTopLevelRouter,
    		routerId,
    		manageFocus,
    		announcementText,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		level,
    		getInitialLocation,
    		location,
    		prevLocation,
    		triggerFocus,
    		createRouteFilter,
    		registerRoute,
    		unregisterRoute,
    		$location,
    		$activeRoute,
    		$prevLocation,
    		$routes,
    		$announcementText
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(10, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(11, url = $$props.url);
    		if ('history' in $$props) $$invalidate(12, history = $$props.history);
    		if ('primary' in $$props) $$invalidate(13, primary = $$props.primary);
    		if ('a11y' in $$props) $$invalidate(14, a11y = $$props.a11y);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*basepath*/ 1024) {
    			if (basepath !== initialBasepath) {
    				warn(ROUTER_ID, 'You cannot change the "basepath" prop. It is ignored.');
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$routes, $location*/ 294912) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$location, $prevLocation*/ 163840) {
    			// Manage focus and announce navigation to screen reader users
    			{
    				if (isTopLevelRouter) {
    					const hasHash = !!$location.hash;

    					// When a hash is present in the url, we skip focus management, because
    					// focusing a different element will prevent in-page jumps (See #3)
    					const shouldManageFocus = !hasHash && manageFocus;

    					// We don't want to make an announcement, when the hash changes,
    					// but the active route stays the same
    					const announceNavigation = !hasHash || $location.pathname !== $prevLocation.pathname;

    					triggerFocus(shouldManageFocus, announceNavigation);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$activeRoute*/ 65536) {
    			// Queue matched Route, so top level Router can decide which Route to focus.
    			// Non primary Routers should just be ignored
    			if (manageFocus && $activeRoute && $activeRoute.primary) {
    				pushFocusCandidate({ level, routerId, route: $activeRoute });
    			}
    		}
    	};

    	return [
    		$announcementText,
    		a11yConfig,
    		isTopLevelRouter,
    		routerId,
    		manageFocus,
    		announcementText,
    		routes,
    		activeRoute,
    		location,
    		prevLocation,
    		basepath,
    		url,
    		history,
    		primary,
    		a11y,
    		$location,
    		$activeRoute,
    		$prevLocation,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$9,
    			create_fragment$9,
    			safe_not_equal,
    			{
    				basepath: 10,
    				url: 11,
    				history: 12,
    				primary: 13,
    				a11y: 14
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get history() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set history(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get a11y() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set a11y(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Router$1 = Router;

    /**
     * Check if a component or hook have been created outside of a
     * context providing component
     * @param {number} componentId
     * @param {*} props
     * @param {string?} ctxKey
     * @param {number?} ctxProviderId
     */
    function usePreflightCheck(
    	componentId,
    	props,
    	ctxKey = ROUTER,
    	ctxProviderId = ROUTER_ID,
    ) {
    	const ctx = getContext(ctxKey);
    	if (!ctx) {
    		fail(
    			componentId,
    			label =>
    				`You cannot use ${label} outside of a ${createLabel(ctxProviderId)}.`,
    			props,
    		);
    	}
    }

    const toReadonly = ctx => {
    	const { subscribe } = getContext(ctx);
    	return { subscribe };
    };

    /**
     * Access the current location via a readable store.
     * @returns {import("svelte/store").Readable<{
        pathname: string;
        search: string;
        hash: string;
        state: {};
      }>}
     *
     * @example
      ```html
      <script>
        import { useLocation } from "svelte-navigator";

        const location = useLocation();

        $: console.log($location);
        // {
        //   pathname: "/blog",
        //   search: "?id=123",
        //   hash: "#comments",
        //   state: {}
        // }
      </script>
      ```
     */
    function useLocation() {
    	usePreflightCheck(USE_LOCATION_ID);
    	return toReadonly(LOCATION);
    }

    /**
     * @typedef {{
        path: string;
        fullPath: string;
        uri: string;
        params: {};
      }} RouteMatch
     */

    /**
     * @typedef {import("svelte/store").Readable<RouteMatch|null>} RouteMatchStore
     */

    /**
     * Access the history of top level Router.
     */
    function useHistory() {
    	const { history } = getContext(ROUTER);
    	return history;
    }

    /**
     * Access the base of the parent Route.
     */
    function useRouteBase() {
    	const route = getContext(ROUTE);
    	return route ? derived(route, _route => _route.base) : writable("/");
    }

    /**
     * Resolve a given link relative to the current `Route` and the `Router`s `basepath`.
     * It is used under the hood in `Link` and `useNavigate`.
     * You can use it to manually resolve links, when using the `link` or `links` actions.
     *
     * @returns {(path: string) => string}
     *
     * @example
      ```html
      <script>
        import { link, useResolve } from "svelte-navigator";

        const resolve = useResolve();
        // `resolvedLink` will be resolved relative to its parent Route
        // and the Routers `basepath`
        const resolvedLink = resolve("relativePath");
      </script>

      <a href={resolvedLink} use:link>Relative link</a>
      ```
     */
    function useResolve() {
    	usePreflightCheck(USE_RESOLVE_ID);
    	const routeBase = useRouteBase();
    	const { basepath: appBase } = getContext(ROUTER);
    	/**
    	 * Resolves the path relative to the current route and basepath.
    	 *
    	 * @param {string} path The path to resolve
    	 * @returns {string} The resolved path
    	 */
    	const resolve = path => resolveLink(path, get_store_value(routeBase), appBase);
    	return resolve;
    }

    /**
     * A hook, that returns a context-aware version of `navigate`.
     * It will automatically resolve the given link relative to the current Route.
     * It will also resolve a link against the `basepath` of the Router.
     *
     * @example
      ```html
      <!-- App.svelte -->
      <script>
        import { link, Route } from "svelte-navigator";
        import RouteComponent from "./RouteComponent.svelte";
      </script>

      <Router>
        <Route path="route1">
          <RouteComponent />
        </Route>
        <!-- ... -->
      </Router>

      <!-- RouteComponent.svelte -->
      <script>
        import { useNavigate } from "svelte-navigator";

        const navigate = useNavigate();
      </script>

      <button on:click="{() => navigate('relativePath')}">
        go to /route1/relativePath
      </button>
      <button on:click="{() => navigate('/absolutePath')}">
        go to /absolutePath
      </button>
      ```
      *
      * @example
      ```html
      <!-- App.svelte -->
      <script>
        import { link, Route } from "svelte-navigator";
        import RouteComponent from "./RouteComponent.svelte";
      </script>

      <Router basepath="/base">
        <Route path="route1">
          <RouteComponent />
        </Route>
        <!-- ... -->
      </Router>

      <!-- RouteComponent.svelte -->
      <script>
        import { useNavigate } from "svelte-navigator";

        const navigate = useNavigate();
      </script>

      <button on:click="{() => navigate('relativePath')}">
        go to /base/route1/relativePath
      </button>
      <button on:click="{() => navigate('/absolutePath')}">
        go to /base/absolutePath
      </button>
      ```
     */
    function useNavigate() {
    	usePreflightCheck(USE_NAVIGATE_ID);
    	const resolve = useResolve();
    	const { navigate } = useHistory();
    	/**
    	 * Navigate to a new route.
    	 * Resolves the link relative to the current route and basepath.
    	 *
    	 * @param {string|number} to The path to navigate to.
    	 *
    	 * If `to` is a number we will navigate to the stack entry index + `to`
    	 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
    	 * @param {Object} options
    	 * @param {*} [options.state]
    	 * @param {boolean} [options.replace=false]
    	 */
    	const navigateRelative = (to, options) => {
    		// If to is a number, we navigate to the target stack entry via `history.go`.
    		// Otherwise resolve the link
    		const target = isNumber(to) ? to : resolve(to);
    		return navigate(target, options);
    	};
    	return navigateRelative;
    }

    /* node_modules/svelte-navigator/src/Route.svelte generated by Svelte v3.50.0 */
    const file$8 = "node_modules/svelte-navigator/src/Route.svelte";

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*$params*/ 16,
    	location: dirty & /*$location*/ 8
    });

    const get_default_slot_context = ctx => ({
    	params: isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4],
    	location: /*$location*/ ctx[3],
    	navigate: /*navigate*/ ctx[10]
    });

    // (97:0) {#if isActive}
    function create_if_block(ctx) {
    	let router;
    	let current;

    	router = new Router$1({
    			props: {
    				primary: /*primary*/ ctx[1],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const router_changes = {};
    			if (dirty & /*primary*/ 2) router_changes.primary = /*primary*/ ctx[1];

    			if (dirty & /*$$scope, component, $location, $params, $$restProps*/ 264217) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(97:0) {#if isActive}",
    		ctx
    	});

    	return block;
    }

    // (113:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $params, $location*/ 262168)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(113:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (105:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[3] },
    		{ navigate: /*navigate*/ ctx[10] },
    		isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4],
    		/*$$restProps*/ ctx[11]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, navigate, isSSR, get, params, $params, $$restProps*/ 3608)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 8 && { location: /*$location*/ ctx[3] },
    					dirty & /*navigate*/ 1024 && { navigate: /*navigate*/ ctx[10] },
    					dirty & /*isSSR, get, params, $params*/ 528 && get_spread_object(isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4]),
    					dirty & /*$$restProps*/ 2048 && get_spread_object(/*$$restProps*/ ctx[11])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(105:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    // (98:1) <Router {primary}>
    function create_default_slot$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(98:1) <Router {primary}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let current;
    	let if_block = /*isActive*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			set_style(div0, "display", "none");
    			attr_dev(div0, "aria-hidden", "true");
    			attr_dev(div0, "data-svnav-route-start", /*id*/ ctx[5]);
    			add_location(div0, file$8, 95, 0, 2622);
    			set_style(div1, "display", "none");
    			attr_dev(div1, "aria-hidden", "true");
    			attr_dev(div1, "data-svnav-route-end", /*id*/ ctx[5]);
    			add_location(div1, file$8, 121, 0, 3295);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isActive*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isActive*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const createId = createCounter();

    function instance$8($$self, $$props, $$invalidate) {
    	let isActive;
    	const omit_props_names = ["path","component","meta","primary"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $activeRoute;
    	let $location;
    	let $parentBase;
    	let $params;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let { meta = {} } = $$props;
    	let { primary = true } = $$props;
    	usePreflightCheck(ROUTE_ID, $$props);
    	const id = createId();
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(15, $activeRoute = value));
    	const parentBase = useRouteBase();
    	validate_store(parentBase, 'parentBase');
    	component_subscribe($$self, parentBase, value => $$invalidate(16, $parentBase = value));
    	const location = useLocation();
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(3, $location = value));
    	const focusElement = writable(null);

    	// In SSR we cannot wait for $activeRoute to update,
    	// so we use the match returned from `registerRoute` instead
    	let ssrMatch;

    	const route = writable();
    	const params = writable({});
    	validate_store(params, 'params');
    	component_subscribe($$self, params, value => $$invalidate(4, $params = value));
    	setContext(ROUTE, route);
    	setContext(ROUTE_PARAMS, params);
    	setContext(FOCUS_ELEM, focusElement);

    	// We need to call useNavigate after the route is set,
    	// so we can use the routes path for link resolution
    	const navigate = useNavigate();

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway
    	if (!isSSR) {
    		onDestroy(() => unregisterRoute(id));
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(23, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(11, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('path' in $$new_props) $$invalidate(12, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('meta' in $$new_props) $$invalidate(13, meta = $$new_props.meta);
    		if ('primary' in $$new_props) $$invalidate(1, primary = $$new_props.primary);
    		if ('$$scope' in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createCounter,
    		createId,
    		getContext,
    		onDestroy,
    		setContext,
    		writable,
    		get: get_store_value,
    		Router: Router$1,
    		ROUTER,
    		ROUTE,
    		ROUTE_PARAMS,
    		FOCUS_ELEM,
    		useLocation,
    		useNavigate,
    		useRouteBase,
    		usePreflightCheck,
    		isSSR,
    		extractBaseUri,
    		join,
    		ROUTE_ID,
    		path,
    		component,
    		meta,
    		primary,
    		id,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		parentBase,
    		location,
    		focusElement,
    		ssrMatch,
    		route,
    		params,
    		navigate,
    		isActive,
    		$activeRoute,
    		$location,
    		$parentBase,
    		$params
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(23, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(12, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('meta' in $$props) $$invalidate(13, meta = $$new_props.meta);
    		if ('primary' in $$props) $$invalidate(1, primary = $$new_props.primary);
    		if ('ssrMatch' in $$props) $$invalidate(14, ssrMatch = $$new_props.ssrMatch);
    		if ('isActive' in $$props) $$invalidate(2, isActive = $$new_props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, $parentBase, meta, $location, primary*/ 77834) {
    			{
    				// The route store will be re-computed whenever props, location or parentBase change
    				const isDefault = path === "";

    				const rawBase = join($parentBase, path);

    				const updatedRoute = {
    					id,
    					path,
    					meta,
    					// If no path prop is given, this Route will act as the default Route
    					// that is rendered if no other Route in the Router is a match
    					default: isDefault,
    					fullPath: isDefault ? "" : rawBase,
    					base: isDefault
    					? $parentBase
    					: extractBaseUri(rawBase, $location.pathname),
    					primary,
    					focusElement
    				};

    				route.set(updatedRoute);

    				// If we're in SSR mode and the Route matches,
    				// `registerRoute` will return the match
    				$$invalidate(14, ssrMatch = registerRoute(updatedRoute));
    			}
    		}

    		if ($$self.$$.dirty & /*ssrMatch, $activeRoute*/ 49152) {
    			$$invalidate(2, isActive = !!(ssrMatch || $activeRoute && $activeRoute.id === id));
    		}

    		if ($$self.$$.dirty & /*isActive, ssrMatch, $activeRoute*/ 49156) {
    			if (isActive) {
    				const { params: activeParams } = ssrMatch || $activeRoute;
    				params.set(activeParams);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		primary,
    		isActive,
    		$location,
    		$params,
    		id,
    		activeRoute,
    		parentBase,
    		location,
    		params,
    		navigate,
    		$$restProps,
    		path,
    		meta,
    		ssrMatch,
    		$activeRoute,
    		$parentBase,
    		slots,
    		$$scope
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			path: 12,
    			component: 0,
    			meta: 13,
    			primary: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get meta() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meta(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Route$1 = Route;

    /* src/Dashboard.svelte generated by Svelte v3.50.0 */

    const file$7 = "src/Dashboard.svelte";

    function create_fragment$7(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "대시보드";
    			attr_dev(h3, "class", "head-text");
    			add_location(h3, file$7, 3, 0, 24);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dashboard', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dashboard> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Dashboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dashboard",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Landing.svelte generated by Svelte v3.50.0 */

    const file$6 = "src/Landing.svelte";

    function create_fragment$6(ctx) {
    	let h3;
    	let t1;
    	let div31;
    	let div11;
    	let div0;
    	let h40;
    	let t3;
    	let div10;
    	let div1;
    	let b0;
    	let t5;
    	let div2;
    	let input0;
    	let t6;
    	let div3;
    	let b1;
    	let t8;
    	let div5;
    	let div4;
    	let input1;
    	let t10;
    	let div6;
    	let b2;
    	let t12;
    	let div8;
    	let div7;
    	let input2;
    	let t14;
    	let div9;
    	let input3;
    	let t15;
    	let t16;
    	let div23;
    	let div12;
    	let h41;
    	let t18;
    	let div22;
    	let div13;
    	let b3;
    	let t20;
    	let div14;
    	let input4;
    	let t21;
    	let div15;
    	let b4;
    	let t23;
    	let div17;
    	let div16;
    	let input5;
    	let t25;
    	let div18;
    	let b5;
    	let t27;
    	let div20;
    	let div19;
    	let input6;
    	let t29;
    	let div21;
    	let input7;
    	let t30;
    	let t31;
    	let div30;
    	let div24;
    	let h42;
    	let t33;
    	let div29;
    	let div25;
    	let b6;
    	let t35;
    	let div26;
    	let input8;
    	let t36;
    	let div27;
    	let b7;
    	let t38;
    	let div28;
    	let input9;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "랜딩 설정";
    			t1 = space();
    			div31 = element("div");
    			div11 = element("div");
    			div0 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Android";
    			t3 = space();
    			div10 = element("div");
    			div1 = element("div");
    			b0 = element("b");
    			b0.textContent = "기본 URL (필수 입력사항)";
    			t5 = space();
    			div2 = element("div");
    			input0 = element("input");
    			t6 = space();
    			div3 = element("div");
    			b1 = element("b");
    			b1.textContent = "앱이 설치되었을 때";
    			t8 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "딥 링크 Scheme : ";
    			input1 = element("input");
    			t10 = space();
    			div6 = element("div");
    			b2 = element("b");
    			b2.textContent = "앱이 설치되지 않았을 때";
    			t12 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div7.textContent = "패키지 이름 : ";
    			input2 = element("input");
    			t14 = space();
    			div9 = element("div");
    			input3 = element("input");
    			t15 = text("App Link를 사용합니다.");
    			t16 = space();
    			div23 = element("div");
    			div12 = element("div");
    			h41 = element("h4");
    			h41.textContent = "iOS";
    			t18 = space();
    			div22 = element("div");
    			div13 = element("div");
    			b3 = element("b");
    			b3.textContent = "기본 URL (필수 입력사항)";
    			t20 = space();
    			div14 = element("div");
    			input4 = element("input");
    			t21 = space();
    			div15 = element("div");
    			b4 = element("b");
    			b4.textContent = "앱이 설치되었을 때";
    			t23 = space();
    			div17 = element("div");
    			div16 = element("div");
    			div16.textContent = "딥 링크 Scheme : ";
    			input5 = element("input");
    			t25 = space();
    			div18 = element("div");
    			b5 = element("b");
    			b5.textContent = "앱이 설치되지 않았을 때";
    			t27 = space();
    			div20 = element("div");
    			div19 = element("div");
    			div19.textContent = "앱 스토어 ID : ";
    			input6 = element("input");
    			t29 = space();
    			div21 = element("div");
    			input7 = element("input");
    			t30 = text("Universal Link를 사용합니다.");
    			t31 = space();
    			div30 = element("div");
    			div24 = element("div");
    			h42 = element("h4");
    			h42.textContent = "PC";
    			t33 = space();
    			div29 = element("div");
    			div25 = element("div");
    			b6 = element("b");
    			b6.textContent = "기본 URL (필수 입력사항)";
    			t35 = space();
    			div26 = element("div");
    			input8 = element("input");
    			t36 = space();
    			div27 = element("div");
    			b7 = element("b");
    			b7.textContent = "앱 다운로드 페이지";
    			t38 = space();
    			div28 = element("div");
    			input9 = element("input");
    			attr_dev(h3, "class", "head-text");
    			add_location(h3, file$6, 3, 0, 24);
    			add_location(h40, file$6, 6, 13, 112);
    			add_location(div0, file$6, 6, 8, 107);
    			add_location(b0, file$6, 8, 32, 197);
    			attr_dev(div1, "class", "header");
    			add_location(div1, file$6, 8, 12, 177);
    			attr_dev(input0, "type", "textbox");
    			attr_dev(input0, "placeholder", "http://petri.app.co.kr");
    			add_location(input0, file$6, 10, 16, 282);
    			attr_dev(div2, "class", "link-textbox");
    			add_location(div2, file$6, 9, 12, 239);
    			add_location(b1, file$6, 12, 32, 394);
    			attr_dev(div3, "class", "header");
    			add_location(div3, file$6, 12, 12, 374);
    			attr_dev(div4, "class", "label");
    			add_location(div4, file$6, 14, 16, 473);
    			attr_dev(input1, "type", "textbox");
    			attr_dev(input1, "placeholder", "http://petri.app.co.kr");
    			add_location(input1, file$6, 14, 55, 512);
    			attr_dev(div5, "class", "link-textbox");
    			add_location(div5, file$6, 13, 12, 430);
    			add_location(b2, file$6, 16, 32, 624);
    			attr_dev(div6, "class", "header");
    			add_location(div6, file$6, 16, 12, 604);
    			attr_dev(div7, "class", "label");
    			add_location(div7, file$6, 18, 16, 706);
    			attr_dev(input2, "type", "textbox");
    			attr_dev(input2, "placeholder", "http://petri.app.co.kr");
    			add_location(input2, file$6, 18, 50, 740);
    			attr_dev(div8, "class", "link-textbox");
    			add_location(div8, file$6, 17, 12, 663);
    			attr_dev(input3, "type", "checkbox");
    			add_location(input3, file$6, 21, 16, 869);
    			attr_dev(div9, "class", "footer");
    			add_location(div9, file$6, 20, 12, 832);
    			attr_dev(div10, "class", "context");
    			add_location(div10, file$6, 7, 8, 143);
    			attr_dev(div11, "class", "cont");
    			add_location(div11, file$6, 5, 4, 80);
    			add_location(h41, file$6, 27, 13, 991);
    			add_location(div12, file$6, 27, 8, 986);
    			add_location(b3, file$6, 29, 32, 1072);
    			attr_dev(div13, "class", "header");
    			add_location(div13, file$6, 29, 12, 1052);
    			attr_dev(input4, "type", "textbox");
    			attr_dev(input4, "placeholder", "http://petri.app.co.kr");
    			add_location(input4, file$6, 31, 16, 1157);
    			attr_dev(div14, "class", "link-textbox");
    			add_location(div14, file$6, 30, 12, 1114);
    			add_location(b4, file$6, 33, 32, 1269);
    			attr_dev(div15, "class", "header");
    			add_location(div15, file$6, 33, 12, 1249);
    			attr_dev(div16, "class", "label");
    			add_location(div16, file$6, 35, 16, 1348);
    			attr_dev(input5, "type", "textbox");
    			attr_dev(input5, "placeholder", "http://petri.app.co.kr");
    			add_location(input5, file$6, 35, 55, 1387);
    			attr_dev(div17, "class", "link-textbox");
    			add_location(div17, file$6, 34, 12, 1305);
    			add_location(b5, file$6, 37, 32, 1499);
    			attr_dev(div18, "class", "header");
    			add_location(div18, file$6, 37, 12, 1479);
    			attr_dev(div19, "class", "label");
    			add_location(div19, file$6, 39, 16, 1581);
    			attr_dev(input6, "type", "textbox");
    			attr_dev(input6, "placeholder", "http://petri.app.co.kr");
    			add_location(input6, file$6, 39, 52, 1617);
    			attr_dev(div20, "class", "link-textbox");
    			add_location(div20, file$6, 38, 12, 1538);
    			attr_dev(input7, "type", "checkbox");
    			add_location(input7, file$6, 42, 16, 1746);
    			attr_dev(div21, "class", "footer");
    			add_location(div21, file$6, 41, 12, 1709);
    			attr_dev(div22, "class", "context");
    			add_location(div22, file$6, 28, 8, 1018);
    			attr_dev(div23, "class", "cont");
    			add_location(div23, file$6, 26, 4, 959);
    			add_location(h42, file$6, 48, 13, 1882);
    			add_location(div24, file$6, 48, 8, 1877);
    			add_location(b6, file$6, 50, 32, 1970);
    			attr_dev(div25, "class", "header");
    			add_location(div25, file$6, 50, 12, 1950);
    			attr_dev(input8, "type", "textbox");
    			attr_dev(input8, "placeholder", "http://petri.app.co.kr");
    			add_location(input8, file$6, 52, 16, 2055);
    			attr_dev(div26, "class", "link-textbox");
    			add_location(div26, file$6, 51, 12, 2012);
    			add_location(b7, file$6, 54, 32, 2167);
    			attr_dev(div27, "class", "header");
    			add_location(div27, file$6, 54, 12, 2147);
    			attr_dev(input9, "type", "textbox");
    			attr_dev(input9, "placeholder", "http://petri.app.co.kr");
    			add_location(input9, file$6, 56, 16, 2246);
    			attr_dev(div28, "class", "link-textbox");
    			add_location(div28, file$6, 55, 12, 2203);
    			attr_dev(div29, "class", "context desktop");
    			add_location(div29, file$6, 49, 8, 1908);
    			attr_dev(div30, "class", "cont desktop");
    			add_location(div30, file$6, 47, 4, 1842);
    			attr_dev(div31, "class", "land");
    			add_location(div31, file$6, 4, 0, 57);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div31, anchor);
    			append_dev(div31, div11);
    			append_dev(div11, div0);
    			append_dev(div0, h40);
    			append_dev(div11, t3);
    			append_dev(div11, div10);
    			append_dev(div10, div1);
    			append_dev(div1, b0);
    			append_dev(div10, t5);
    			append_dev(div10, div2);
    			append_dev(div2, input0);
    			append_dev(div10, t6);
    			append_dev(div10, div3);
    			append_dev(div3, b1);
    			append_dev(div10, t8);
    			append_dev(div10, div5);
    			append_dev(div5, div4);
    			append_dev(div5, input1);
    			append_dev(div10, t10);
    			append_dev(div10, div6);
    			append_dev(div6, b2);
    			append_dev(div10, t12);
    			append_dev(div10, div8);
    			append_dev(div8, div7);
    			append_dev(div8, input2);
    			append_dev(div10, t14);
    			append_dev(div10, div9);
    			append_dev(div9, input3);
    			append_dev(div9, t15);
    			append_dev(div31, t16);
    			append_dev(div31, div23);
    			append_dev(div23, div12);
    			append_dev(div12, h41);
    			append_dev(div23, t18);
    			append_dev(div23, div22);
    			append_dev(div22, div13);
    			append_dev(div13, b3);
    			append_dev(div22, t20);
    			append_dev(div22, div14);
    			append_dev(div14, input4);
    			append_dev(div22, t21);
    			append_dev(div22, div15);
    			append_dev(div15, b4);
    			append_dev(div22, t23);
    			append_dev(div22, div17);
    			append_dev(div17, div16);
    			append_dev(div17, input5);
    			append_dev(div22, t25);
    			append_dev(div22, div18);
    			append_dev(div18, b5);
    			append_dev(div22, t27);
    			append_dev(div22, div20);
    			append_dev(div20, div19);
    			append_dev(div20, input6);
    			append_dev(div22, t29);
    			append_dev(div22, div21);
    			append_dev(div21, input7);
    			append_dev(div21, t30);
    			append_dev(div31, t31);
    			append_dev(div31, div30);
    			append_dev(div30, div24);
    			append_dev(div24, h42);
    			append_dev(div30, t33);
    			append_dev(div30, div29);
    			append_dev(div29, div25);
    			append_dev(div25, b6);
    			append_dev(div29, t35);
    			append_dev(div29, div26);
    			append_dev(div26, input8);
    			append_dev(div29, t36);
    			append_dev(div29, div27);
    			append_dev(div27, b7);
    			append_dev(div29, t38);
    			append_dev(div29, div28);
    			append_dev(div28, input9);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div31);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Landing', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Landing> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Landing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Landing",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/CampaignInfo.svelte generated by Svelte v3.50.0 */

    const file$5 = "src/CampaignInfo.svelte";

    function create_fragment$5(ctx) {
    	let div11;
    	let div10;
    	let div9;
    	let div0;
    	let h5;
    	let t1;
    	let button0;
    	let span;
    	let t3;
    	let div7;
    	let div4;
    	let div1;
    	let t5;
    	let div2;
    	let t7;
    	let div3;
    	let t9;
    	let div5;
    	let t11;
    	let table;
    	let thead;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let tbody;
    	let tr0;
    	let td2;
    	let t17;
    	let td3;
    	let t18;
    	let tr1;
    	let td4;
    	let t20;
    	let td5;
    	let t21;
    	let div6;
    	let t23;
    	let div8;
    	let button1;

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = "캠페인 상세보기";
    			t1 = space();
    			button0 = element("button");
    			span = element("span");
    			span.textContent = "×";
    			t3 = space();
    			div7 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			div1.textContent = "KPI";
    			t5 = space();
    			div2 = element("div");
    			div2.textContent = "포스트백 설정";
    			t7 = space();
    			div3 = element("div");
    			div3.textContent = "Fraud 설정";
    			t9 = space();
    			div5 = element("div");
    			div5.textContent = "앱 오픈 포스트백";
    			t11 = space();
    			table = element("table");
    			thead = element("thead");
    			td0 = element("td");
    			td0.textContent = "오픈 타입";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "상태";
    			t15 = space();
    			tbody = element("tbody");
    			tr0 = element("tr");
    			td2 = element("td");
    			td2.textContent = "신규 설치";
    			t17 = space();
    			td3 = element("td");
    			t18 = space();
    			tr1 = element("tr");
    			td4 = element("td");
    			td4.textContent = "재 설치";
    			t20 = space();
    			td5 = element("td");
    			t21 = space();
    			div6 = element("div");
    			div6.textContent = "앱 이벤트 포스트백";
    			t23 = space();
    			div8 = element("div");
    			button1 = element("button");
    			button1.textContent = "닫기";
    			attr_dev(h5, "class", "modal-title");
    			add_location(h5, file$5, 4, 10, 196);
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file$5, 6, 12, 333);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "close");
    			attr_dev(button0, "data-dismiss", "modal");
    			attr_dev(button0, "aria-label", "Close");
    			add_location(button0, file$5, 5, 10, 244);
    			attr_dev(div0, "class", "modal-header");
    			add_location(div0, file$5, 3, 8, 159);
    			attr_dev(div1, "class", "section");
    			add_location(div1, file$5, 11, 12, 488);
    			attr_dev(div2, "class", "section");
    			add_location(div2, file$5, 12, 12, 533);
    			attr_dev(div3, "class", "section");
    			add_location(div3, file$5, 13, 12, 580);
    			attr_dev(div4, "class", "top-header");
    			add_location(div4, file$5, 10, 10, 451);
    			attr_dev(div5, "class", "sub-header");
    			add_location(div5, file$5, 15, 10, 645);
    			add_location(td0, file$5, 18, 14, 763);
    			add_location(td1, file$5, 19, 14, 792);
    			add_location(thead, file$5, 17, 12, 741);
    			add_location(td2, file$5, 23, 16, 880);
    			add_location(td3, file$5, 24, 16, 911);
    			add_location(tr0, file$5, 22, 14, 859);
    			add_location(td4, file$5, 27, 16, 976);
    			add_location(td5, file$5, 28, 16, 1006);
    			add_location(tr1, file$5, 26, 14, 955);
    			add_location(tbody, file$5, 21, 12, 837);
    			attr_dev(table, "class", "app-open-postback");
    			add_location(table, file$5, 16, 10, 695);
    			attr_dev(div6, "class", "sub-header");
    			add_location(div6, file$5, 32, 10, 1086);
    			attr_dev(div7, "class", "modal-body");
    			add_location(div7, file$5, 9, 8, 416);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-secondary");
    			attr_dev(button1, "data-dismiss", "modal");
    			add_location(button1, file$5, 35, 10, 1187);
    			attr_dev(div8, "class", "modal-footer");
    			add_location(div8, file$5, 34, 8, 1150);
    			attr_dev(div9, "class", "modal-content");
    			add_location(div9, file$5, 2, 6, 123);
    			attr_dev(div10, "class", "modal-dialog");
    			attr_dev(div10, "role", "document");
    			add_location(div10, file$5, 1, 4, 74);
    			attr_dev(div11, "class", "modal campaign-info");
    			attr_dev(div11, "tabindex", "-1");
    			attr_dev(div11, "role", "dialog");
    			attr_dev(div11, "id", "ci");
    			add_location(div11, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div0);
    			append_dev(div0, h5);
    			append_dev(div0, t1);
    			append_dev(div0, button0);
    			append_dev(button0, span);
    			append_dev(div9, t3);
    			append_dev(div9, div7);
    			append_dev(div7, div4);
    			append_dev(div4, div1);
    			append_dev(div4, t5);
    			append_dev(div4, div2);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div7, t9);
    			append_dev(div7, div5);
    			append_dev(div7, t11);
    			append_dev(div7, table);
    			append_dev(table, thead);
    			append_dev(thead, td0);
    			append_dev(thead, t13);
    			append_dev(thead, td1);
    			append_dev(table, t15);
    			append_dev(table, tbody);
    			append_dev(tbody, tr0);
    			append_dev(tr0, td2);
    			append_dev(tr0, t17);
    			append_dev(tr0, td3);
    			append_dev(tbody, t18);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td4);
    			append_dev(tr1, t20);
    			append_dev(tr1, td5);
    			append_dev(div7, t21);
    			append_dev(div7, div6);
    			append_dev(div9, t23);
    			append_dev(div9, div8);
    			append_dev(div8, button1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CampaignInfo', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CampaignInfo> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class CampaignInfo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CampaignInfo",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Campaign.svelte generated by Svelte v3.50.0 */
    const file$4 = "src/Campaign.svelte";

    function create_fragment$4(ctx) {
    	let h3;
    	let t1;
    	let table;
    	let thead;
    	let td0;
    	let t3;
    	let td1;
    	let t5;
    	let td2;
    	let t7;
    	let td3;
    	let t9;
    	let td4;
    	let t11;
    	let td5;
    	let t12;
    	let tbody;
    	let tr0;
    	let td6;
    	let t14;
    	let td7;
    	let t16;
    	let td8;
    	let t17;
    	let br0;
    	let t18;
    	let t19;
    	let td9;
    	let t21;
    	let td10;
    	let t23;
    	let td11;
    	let span0;
    	let t25;
    	let tr1;
    	let td12;
    	let t27;
    	let td13;
    	let t29;
    	let td14;
    	let t30;
    	let br1;
    	let t31;
    	let t32;
    	let td15;
    	let t34;
    	let td16;
    	let t36;
    	let td17;
    	let span1;
    	let t38;
    	let tr2;
    	let td18;
    	let t40;
    	let td19;
    	let t42;
    	let td20;
    	let t43;
    	let br2;
    	let t44;
    	let t45;
    	let td21;
    	let t47;
    	let td22;
    	let t49;
    	let td23;
    	let span2;
    	let t51;
    	let tr3;
    	let td24;
    	let t53;
    	let td25;
    	let t55;
    	let td26;
    	let t56;
    	let br3;
    	let t57;
    	let t58;
    	let td27;
    	let t60;
    	let td28;
    	let t62;
    	let td29;
    	let span3;
    	let t64;
    	let tr4;
    	let td30;
    	let t66;
    	let td31;
    	let t68;
    	let td32;
    	let t69;
    	let br4;
    	let t70;
    	let t71;
    	let td33;
    	let t73;
    	let td34;
    	let t75;
    	let td35;
    	let span4;
    	let t77;
    	let campaigninfo;
    	let current;
    	let mounted;
    	let dispose;
    	campaigninfo = new CampaignInfo({ $$inline: true });

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "캠페인 설정";
    			t1 = space();
    			table = element("table");
    			thead = element("thead");
    			td0 = element("td");
    			td0.textContent = "캠페인 이름";
    			t3 = space();
    			td1 = element("td");
    			td1.textContent = "파트너";
    			t5 = space();
    			td2 = element("td");
    			td2.textContent = "포스트백 설정";
    			t7 = space();
    			td3 = element("td");
    			td3.textContent = "수정 날짜/시각";
    			t9 = space();
    			td4 = element("td");
    			td4.textContent = "생성 날짜/시각";
    			t11 = space();
    			td5 = element("td");
    			t12 = space();
    			tbody = element("tbody");
    			tr0 = element("tr");
    			td6 = element("td");
    			td6.textContent = "모비온";
    			t14 = space();
    			td7 = element("td");
    			td7.textContent = "구글 애즈";
    			t16 = space();
    			td8 = element("td");
    			t17 = text("오픈 포스트백");
    			br0 = element("br");
    			t18 = text("이벤트 포스트백");
    			t19 = space();
    			td9 = element("td");
    			td9.textContent = "2022-09-02 11:14";
    			t21 = space();
    			td10 = element("td");
    			td10.textContent = "2022-09-05 12:01";
    			t23 = space();
    			td11 = element("td");
    			span0 = element("span");
    			span0.textContent = "상세 보기";
    			t25 = space();
    			tr1 = element("tr");
    			td12 = element("td");
    			td12.textContent = "performance_NCPI";
    			t27 = space();
    			td13 = element("td");
    			td13.textContent = "구글 애즈";
    			t29 = space();
    			td14 = element("td");
    			t30 = text("오픈 포스트백");
    			br1 = element("br");
    			t31 = text("이벤트 포스트백");
    			t32 = space();
    			td15 = element("td");
    			td15.textContent = "2022-09-02 11:14";
    			t34 = space();
    			td16 = element("td");
    			td16.textContent = "2022-09-05 12:01";
    			t36 = space();
    			td17 = element("td");
    			span1 = element("span");
    			span1.textContent = "상세 보기";
    			t38 = space();
    			tr2 = element("tr");
    			td18 = element("td");
    			td18.textContent = "performance_NCPI";
    			t40 = space();
    			td19 = element("td");
    			td19.textContent = "구글 애즈";
    			t42 = space();
    			td20 = element("td");
    			t43 = text("오픈 포스트백");
    			br2 = element("br");
    			t44 = text("이벤트 포스트백");
    			t45 = space();
    			td21 = element("td");
    			td21.textContent = "2022-09-02 11:14";
    			t47 = space();
    			td22 = element("td");
    			td22.textContent = "2022-09-05 12:01";
    			t49 = space();
    			td23 = element("td");
    			span2 = element("span");
    			span2.textContent = "상세 보기";
    			t51 = space();
    			tr3 = element("tr");
    			td24 = element("td");
    			td24.textContent = "performance_NCPI";
    			t53 = space();
    			td25 = element("td");
    			td25.textContent = "구글 애즈";
    			t55 = space();
    			td26 = element("td");
    			t56 = text("오픈 포스트백");
    			br3 = element("br");
    			t57 = text("이벤트 포스트백");
    			t58 = space();
    			td27 = element("td");
    			td27.textContent = "2022-09-02 11:14";
    			t60 = space();
    			td28 = element("td");
    			td28.textContent = "2022-09-05 12:01";
    			t62 = space();
    			td29 = element("td");
    			span3 = element("span");
    			span3.textContent = "상세 보기";
    			t64 = space();
    			tr4 = element("tr");
    			td30 = element("td");
    			td30.textContent = "performance_NCPI";
    			t66 = space();
    			td31 = element("td");
    			td31.textContent = "구글 애즈";
    			t68 = space();
    			td32 = element("td");
    			t69 = text("오픈 포스트백");
    			br4 = element("br");
    			t70 = text("이벤트 포스트백");
    			t71 = space();
    			td33 = element("td");
    			td33.textContent = "2022-09-02 11:14";
    			t73 = space();
    			td34 = element("td");
    			td34.textContent = "2022-09-05 12:01";
    			t75 = space();
    			td35 = element("td");
    			span4 = element("span");
    			span4.textContent = "상세 보기";
    			t77 = space();
    			create_component(campaigninfo.$$.fragment);
    			attr_dev(h3, "class", "head-text");
    			add_location(h3, file$4, 8, 0, 132);
    			add_location(td0, file$4, 11, 8, 216);
    			add_location(td1, file$4, 12, 8, 240);
    			add_location(td2, file$4, 13, 8, 261);
    			add_location(td3, file$4, 14, 8, 286);
    			add_location(td4, file$4, 15, 8, 312);
    			add_location(td5, file$4, 16, 8, 338);
    			add_location(thead, file$4, 10, 4, 200);
    			add_location(td6, file$4, 20, 12, 398);
    			add_location(td7, file$4, 21, 12, 423);
    			add_location(br0, file$4, 22, 23, 461);
    			add_location(td8, file$4, 22, 12, 450);
    			add_location(td9, file$4, 23, 12, 491);
    			add_location(td10, file$4, 24, 12, 529);
    			attr_dev(span0, "class", "load-campaign");
    			add_location(span0, file$4, 25, 16, 571);
    			add_location(td11, file$4, 25, 12, 567);
    			add_location(tr0, file$4, 19, 8, 381);
    			add_location(td12, file$4, 28, 12, 680);
    			add_location(td13, file$4, 29, 12, 718);
    			add_location(br1, file$4, 30, 23, 756);
    			add_location(td14, file$4, 30, 12, 745);
    			add_location(td15, file$4, 31, 12, 786);
    			add_location(td16, file$4, 32, 12, 824);
    			attr_dev(span1, "class", "load-campaign");
    			add_location(span1, file$4, 33, 16, 866);
    			add_location(td17, file$4, 33, 12, 862);
    			add_location(tr1, file$4, 27, 8, 663);
    			add_location(td18, file$4, 36, 12, 975);
    			add_location(td19, file$4, 37, 12, 1013);
    			add_location(br2, file$4, 38, 23, 1051);
    			add_location(td20, file$4, 38, 12, 1040);
    			add_location(td21, file$4, 39, 12, 1081);
    			add_location(td22, file$4, 40, 12, 1119);
    			attr_dev(span2, "class", "load-campaign");
    			add_location(span2, file$4, 41, 16, 1161);
    			add_location(td23, file$4, 41, 12, 1157);
    			add_location(tr2, file$4, 35, 8, 958);
    			add_location(td24, file$4, 44, 12, 1270);
    			add_location(td25, file$4, 45, 12, 1308);
    			add_location(br3, file$4, 46, 23, 1346);
    			add_location(td26, file$4, 46, 12, 1335);
    			add_location(td27, file$4, 47, 12, 1376);
    			add_location(td28, file$4, 48, 12, 1414);
    			attr_dev(span3, "class", "load-campaign");
    			add_location(span3, file$4, 49, 16, 1456);
    			add_location(td29, file$4, 49, 12, 1452);
    			add_location(tr3, file$4, 43, 8, 1253);
    			add_location(td30, file$4, 52, 12, 1565);
    			add_location(td31, file$4, 53, 12, 1603);
    			add_location(br4, file$4, 54, 23, 1641);
    			add_location(td32, file$4, 54, 12, 1630);
    			add_location(td33, file$4, 55, 12, 1671);
    			add_location(td34, file$4, 56, 12, 1709);
    			attr_dev(span4, "class", "load-campaign");
    			add_location(span4, file$4, 57, 16, 1751);
    			add_location(td35, file$4, 57, 12, 1747);
    			add_location(tr4, file$4, 51, 8, 1548);
    			add_location(tbody, file$4, 18, 4, 365);
    			attr_dev(table, "class", "campaign-list");
    			add_location(table, file$4, 9, 0, 166);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, td0);
    			append_dev(thead, t3);
    			append_dev(thead, td1);
    			append_dev(thead, t5);
    			append_dev(thead, td2);
    			append_dev(thead, t7);
    			append_dev(thead, td3);
    			append_dev(thead, t9);
    			append_dev(thead, td4);
    			append_dev(thead, t11);
    			append_dev(thead, td5);
    			append_dev(table, t12);
    			append_dev(table, tbody);
    			append_dev(tbody, tr0);
    			append_dev(tr0, td6);
    			append_dev(tr0, t14);
    			append_dev(tr0, td7);
    			append_dev(tr0, t16);
    			append_dev(tr0, td8);
    			append_dev(td8, t17);
    			append_dev(td8, br0);
    			append_dev(td8, t18);
    			append_dev(tr0, t19);
    			append_dev(tr0, td9);
    			append_dev(tr0, t21);
    			append_dev(tr0, td10);
    			append_dev(tr0, t23);
    			append_dev(tr0, td11);
    			append_dev(td11, span0);
    			append_dev(tbody, t25);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td12);
    			append_dev(tr1, t27);
    			append_dev(tr1, td13);
    			append_dev(tr1, t29);
    			append_dev(tr1, td14);
    			append_dev(td14, t30);
    			append_dev(td14, br1);
    			append_dev(td14, t31);
    			append_dev(tr1, t32);
    			append_dev(tr1, td15);
    			append_dev(tr1, t34);
    			append_dev(tr1, td16);
    			append_dev(tr1, t36);
    			append_dev(tr1, td17);
    			append_dev(td17, span1);
    			append_dev(tbody, t38);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td18);
    			append_dev(tr2, t40);
    			append_dev(tr2, td19);
    			append_dev(tr2, t42);
    			append_dev(tr2, td20);
    			append_dev(td20, t43);
    			append_dev(td20, br2);
    			append_dev(td20, t44);
    			append_dev(tr2, t45);
    			append_dev(tr2, td21);
    			append_dev(tr2, t47);
    			append_dev(tr2, td22);
    			append_dev(tr2, t49);
    			append_dev(tr2, td23);
    			append_dev(td23, span2);
    			append_dev(tbody, t51);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td24);
    			append_dev(tr3, t53);
    			append_dev(tr3, td25);
    			append_dev(tr3, t55);
    			append_dev(tr3, td26);
    			append_dev(td26, t56);
    			append_dev(td26, br3);
    			append_dev(td26, t57);
    			append_dev(tr3, t58);
    			append_dev(tr3, td27);
    			append_dev(tr3, t60);
    			append_dev(tr3, td28);
    			append_dev(tr3, t62);
    			append_dev(tr3, td29);
    			append_dev(td29, span3);
    			append_dev(tbody, t64);
    			append_dev(tbody, tr4);
    			append_dev(tr4, td30);
    			append_dev(tr4, t66);
    			append_dev(tr4, td31);
    			append_dev(tr4, t68);
    			append_dev(tr4, td32);
    			append_dev(td32, t69);
    			append_dev(td32, br4);
    			append_dev(td32, t70);
    			append_dev(tr4, t71);
    			append_dev(tr4, td33);
    			append_dev(tr4, t73);
    			append_dev(tr4, td34);
    			append_dev(tr4, t75);
    			append_dev(tr4, td35);
    			append_dev(td35, span4);
    			insert_dev(target, t77, anchor);
    			mount_component(campaigninfo, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", showCampaign, false, false, false),
    					listen_dev(span1, "click", showCampaign, false, false, false),
    					listen_dev(span2, "click", showCampaign, false, false, false),
    					listen_dev(span3, "click", showCampaign, false, false, false),
    					listen_dev(span4, "click", showCampaign, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(campaigninfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(campaigninfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);
    			if (detaching) detach_dev(t77);
    			destroy_component(campaigninfo, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function showCampaign() {
    	window.$('#ci').modal('show');
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Campaign', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Campaign> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ CampaignInfo, showCampaign });
    	return [];
    }

    class Campaign extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Campaign",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Fraud.svelte generated by Svelte v3.50.0 */

    const file$3 = "src/Fraud.svelte";

    function create_fragment$3(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "프로드 방지";
    			attr_dev(h3, "class", "head-text");
    			add_location(h3, file$3, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Fraud', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Fraud> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Fraud extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fraud",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Tracking.svelte generated by Svelte v3.50.0 */

    const file$2 = "src/Tracking.svelte";

    function create_fragment$2(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "트래킹 링크";
    			attr_dev(h3, "class", "head-text");
    			add_location(h3, file$2, 3, 0, 24);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tracking', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tracking> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Tracking extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tracking",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Attr.svelte generated by Svelte v3.50.0 */

    const file$1 = "src/Attr.svelte";

    function create_fragment$1(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "측정 모델";
    			attr_dev(h3, "class", "head-text");
    			add_location(h3, file$1, 3, 0, 24);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Attr', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Attr> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Attr extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Attr",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.50.0 */
    const file = "src/App.svelte";

    // (20:2) <Router>
    function create_default_slot_7(ctx) {
    	let ul7;
    	let li;
    	let a0;
    	let ul0;
    	let i0;
    	let t0;
    	let t1;
    	let a1;
    	let ul1;
    	let i1;
    	let t2;
    	let t3;
    	let a2;
    	let ul2;
    	let i2;
    	let t4;
    	let t5;
    	let a3;
    	let ul3;
    	let i3;
    	let t6;
    	let t7;
    	let a4;
    	let ul4;
    	let i4;
    	let t8;
    	let t9;
    	let a5;
    	let ul5;
    	let i5;
    	let t10;
    	let t11;
    	let a6;
    	let ul6;
    	let i6;
    	let t12;

    	const block = {
    		c: function create() {
    			ul7 = element("ul");
    			li = element("li");
    			a0 = element("a");
    			ul0 = element("ul");
    			i0 = element("i");
    			t0 = text("대시보드");
    			t1 = space();
    			a1 = element("a");
    			ul1 = element("ul");
    			i1 = element("i");
    			t2 = text("캠페인");
    			t3 = space();
    			a2 = element("a");
    			ul2 = element("ul");
    			i2 = element("i");
    			t4 = text("랜딩 설정");
    			t5 = space();
    			a3 = element("a");
    			ul3 = element("ul");
    			i3 = element("i");
    			t6 = text("트래킹 링크");
    			t7 = space();
    			a4 = element("a");
    			ul4 = element("ul");
    			i4 = element("i");
    			t8 = text("프로드 방지");
    			t9 = space();
    			a5 = element("a");
    			ul5 = element("ul");
    			i5 = element("i");
    			t10 = text("측정 모델");
    			t11 = space();
    			a6 = element("a");
    			ul6 = element("ul");
    			i6 = element("i");
    			t12 = text("시스템 현황");
    			attr_dev(i0, "class", "bi bi-clipboard-data nav-icon svelte-1ck4juy");
    			add_location(i0, file, 22, 51, 777);
    			attr_dev(ul0, "class", "nav-link-li");
    			add_location(ul0, file, 22, 27, 753);
    			attr_dev(a0, "href", "/dashboard");
    			add_location(a0, file, 22, 5, 731);
    			attr_dev(i1, "class", "bi bi-globe nav-icon svelte-1ck4juy");
    			add_location(i1, file, 23, 50, 886);
    			attr_dev(ul1, "class", "nav-link-li");
    			add_location(ul1, file, 23, 26, 862);
    			attr_dev(a1, "href", "/campaign");
    			add_location(a1, file, 23, 5, 841);
    			attr_dev(i2, "class", "bi bi-gear nav-icon svelte-1ck4juy");
    			add_location(i2, file, 24, 49, 984);
    			attr_dev(ul2, "class", "nav-link-li");
    			add_location(ul2, file, 24, 25, 960);
    			attr_dev(a2, "href", "/landing");
    			add_location(a2, file, 24, 5, 940);
    			attr_dev(i3, "class", "bi bi-share nav-icon svelte-1ck4juy");
    			add_location(i3, file, 25, 50, 1084);
    			attr_dev(ul3, "class", "nav-link-li");
    			add_location(ul3, file, 25, 26, 1060);
    			attr_dev(a3, "href", "/tracking");
    			add_location(a3, file, 25, 5, 1039);
    			attr_dev(i4, "class", "bi bi-emoji-smile-fill nav-icon svelte-1ck4juy");
    			add_location(i4, file, 26, 47, 1183);
    			attr_dev(ul4, "class", "nav-link-li");
    			add_location(ul4, file, 26, 23, 1159);
    			attr_dev(a4, "href", "/fraud");
    			add_location(a4, file, 26, 5, 1141);
    			attr_dev(i5, "class", "bi bi-bar-chart nav-icon svelte-1ck4juy");
    			add_location(i5, file, 27, 46, 1292);
    			attr_dev(ul5, "class", "nav-link-li");
    			add_location(ul5, file, 27, 22, 1268);
    			attr_dev(a5, "href", "/attr");
    			add_location(a5, file, 27, 5, 1251);
    			attr_dev(i6, "class", "bi bi-gear nav-icon svelte-1ck4juy");
    			add_location(i6, file, 28, 48, 1396);
    			attr_dev(ul6, "class", "nav-link-li");
    			add_location(ul6, file, 28, 24, 1372);
    			attr_dev(a6, "href", "/system");
    			add_location(a6, file, 28, 5, 1353);
    			add_location(li, file, 21, 4, 721);
    			attr_dev(ul7, "class", "nav-no-bullets svelte-1ck4juy");
    			add_location(ul7, file, 20, 3, 689);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul7, anchor);
    			append_dev(ul7, li);
    			append_dev(li, a0);
    			append_dev(a0, ul0);
    			append_dev(ul0, i0);
    			append_dev(ul0, t0);
    			append_dev(li, t1);
    			append_dev(li, a1);
    			append_dev(a1, ul1);
    			append_dev(ul1, i1);
    			append_dev(ul1, t2);
    			append_dev(li, t3);
    			append_dev(li, a2);
    			append_dev(a2, ul2);
    			append_dev(ul2, i2);
    			append_dev(ul2, t4);
    			append_dev(li, t5);
    			append_dev(li, a3);
    			append_dev(a3, ul3);
    			append_dev(ul3, i3);
    			append_dev(ul3, t6);
    			append_dev(li, t7);
    			append_dev(li, a4);
    			append_dev(a4, ul4);
    			append_dev(ul4, i4);
    			append_dev(ul4, t8);
    			append_dev(li, t9);
    			append_dev(li, a5);
    			append_dev(a5, ul5);
    			append_dev(ul5, i5);
    			append_dev(ul5, t10);
    			append_dev(li, t11);
    			append_dev(li, a6);
    			append_dev(a6, ul6);
    			append_dev(ul6, i6);
    			append_dev(ul6, t12);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(20:2) <Router>",
    		ctx
    	});

    	return block;
    }

    // (41:4) <Route path="/dashboard" primary={false}>
    function create_default_slot_6(ctx) {
    	let dashboard;
    	let current;
    	dashboard = new Dashboard({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(dashboard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dashboard, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dashboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dashboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dashboard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(41:4) <Route path=\\\"/dashboard\\\" primary={false}>",
    		ctx
    	});

    	return block;
    }

    // (46:4) <Route path="/tracking" primary={false}>
    function create_default_slot_5(ctx) {
    	let tracking;
    	let current;
    	tracking = new Tracking({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tracking.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tracking, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tracking.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tracking.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tracking, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(46:4) <Route path=\\\"/tracking\\\" primary={false}>",
    		ctx
    	});

    	return block;
    }

    // (51:4) <Route path="/landing" primary={false}>
    function create_default_slot_4(ctx) {
    	let landing;
    	let current;
    	landing = new Landing({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(landing.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(landing, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(landing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(landing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(landing, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(51:4) <Route path=\\\"/landing\\\" primary={false}>",
    		ctx
    	});

    	return block;
    }

    // (56:4) <Route path="/campaign" primary={false}>
    function create_default_slot_3(ctx) {
    	let campaign;
    	let current;
    	campaign = new Campaign({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(campaign.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(campaign, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(campaign.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(campaign.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(campaign, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(56:4) <Route path=\\\"/campaign\\\" primary={false}>",
    		ctx
    	});

    	return block;
    }

    // (61:4) <Route path="/fraud" primary={false}>
    function create_default_slot_2(ctx) {
    	let fraud;
    	let current;
    	fraud = new Fraud({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(fraud.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fraud, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fraud.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fraud.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fraud, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(61:4) <Route path=\\\"/fraud\\\" primary={false}>",
    		ctx
    	});

    	return block;
    }

    // (66:4) <Route path="/attr" primary={false}>
    function create_default_slot_1(ctx) {
    	let attr_1;
    	let current;
    	attr_1 = new Attr({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(attr_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(attr_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(attr_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(attr_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(attr_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(66:4) <Route path=\\\"/attr\\\" primary={false}>",
    		ctx
    	});

    	return block;
    }

    // (39:3) <Router>
    function create_default_slot(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let route3;
    	let t3;
    	let route4;
    	let t4;
    	let route5;
    	let current;

    	route0 = new Route$1({
    			props: {
    				path: "/dashboard",
    				primary: false,
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route$1({
    			props: {
    				path: "/tracking",
    				primary: false,
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route$1({
    			props: {
    				path: "/landing",
    				primary: false,
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route$1({
    			props: {
    				path: "/campaign",
    				primary: false,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route4 = new Route$1({
    			props: {
    				path: "/fraud",
    				primary: false,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route5 = new Route$1({
    			props: {
    				path: "/attr",
    				primary: false,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    			t3 = space();
    			create_component(route4.$$.fragment);
    			t4 = space();
    			create_component(route5.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route5, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    			const route4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route4_changes.$$scope = { dirty, ctx };
    			}

    			route4.$set(route4_changes);
    			const route5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route5_changes.$$scope = { dirty, ctx };
    			}

    			route5.$set(route5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(route5, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(39:3) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let span;
    	let t1;
    	let div4;
    	let div3;
    	let a;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let router0;
    	let t6;
    	let div6;
    	let div5;
    	let router1;
    	let current;

    	router0 = new Router$1({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	router1 = new Router$1({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "메뉴 펼치기";
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");
    			a = element("a");
    			div1 = element("div");
    			div1.textContent = "로그아웃";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "메뉴닫기";
    			t5 = space();
    			create_component(router0.$$.fragment);
    			t6 = space();
    			div6 = element("div");
    			div5 = element("div");
    			create_component(router1.$$.fragment);
    			attr_dev(span, "class", "nav-open-menu svelte-1ck4juy");
    			attr_dev(span, "id", "open-menu");
    			attr_dev(span, "onclick", "openMenu()");
    			add_location(span, file, 12, 23, 394);
    			attr_dev(div0, "class", "top-cont svelte-1ck4juy");
    			add_location(div0, file, 12, 1, 372);
    			attr_dev(div1, "class", "nav-logout svelte-1ck4juy");
    			add_location(div1, file, 15, 27, 563);
    			attr_dev(a, "href", "../index.html");
    			add_location(a, file, 15, 3, 539);
    			attr_dev(div2, "class", "nav-close-out svelte-1ck4juy");
    			attr_dev(div2, "onclick", "closeMenu()");
    			add_location(div2, file, 16, 3, 605);
    			attr_dev(div3, "class", "top-nav svelte-1ck4juy");
    			add_location(div3, file, 14, 2, 514);
    			attr_dev(div4, "class", "nav svelte-1ck4juy");
    			attr_dev(div4, "id", "left-menu");
    			add_location(div4, file, 13, 1, 479);
    			attr_dev(div5, "class", "mid-cont svelte-1ck4juy");
    			add_location(div5, file, 37, 2, 1525);
    			attr_dev(div6, "class", "cont svelte-1ck4juy");
    			attr_dev(div6, "id", "main");
    			add_location(div6, file, 34, 1, 1490);
    			attr_dev(main, "class", "svelte-1ck4juy");
    			add_location(main, file, 11, 0, 364);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, span);
    			append_dev(main, t1);
    			append_dev(main, div4);
    			append_dev(div4, div3);
    			append_dev(div3, a);
    			append_dev(a, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div4, t5);
    			mount_component(router0, div4, null);
    			append_dev(main, t6);
    			append_dev(main, div6);
    			append_dev(div6, div5);
    			mount_component(router1, div5, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router0_changes.$$scope = { dirty, ctx };
    			}

    			router0.$set(router0_changes);
    			const router1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router1_changes.$$scope = { dirty, ctx };
    			}

    			router1.$set(router1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router0.$$.fragment, local);
    			transition_in(router1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router0.$$.fragment, local);
    			transition_out(router1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router0);
    			destroy_component(router1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router: Router$1,
    		Route: Route$1,
    		Dashboard,
    		Landing,
    		Campaign,
    		CampaignInfo,
    		Fraud,
    		Tracking,
    		Attr
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
