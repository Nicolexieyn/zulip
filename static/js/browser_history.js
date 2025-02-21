import * as blueslip from "./blueslip";
import * as hash_util from "./hash_util";
import * as ui_util from "./ui_util";

const state = {
    is_internal_change: false,
    hash_before_overlay: null,
    old_hash: window.location.hash,
};

export function clear_for_testing() {
    state.is_internal_change = false;
    state.hash_before_overlay = null;
    state.old_hash = "#";
}

export function old_hash() {
    return state.old_hash;
}

export function set_hash_before_overlay(hash) {
    state.hash_before_overlay = hash;
}

export function save_old_hash() {
    state.old_hash = window.location.hash;

    const was_internal_change = state.is_internal_change;
    state.is_internal_change = false;

    return was_internal_change;
}

export function update(new_hash) {
    const old_hash = window.location.hash;

    if (!new_hash.startsWith("#")) {
        blueslip.error("programming error: prefix hashes with #: " + new_hash);
        return;
    }

    if (old_hash === new_hash) {
        // If somebody is calling us with the same hash we already have, it's
        // probably harmless, and we just ignore it.  But it could be a symptom
        // of disorganized code that's prone to an infinite loop of repeatedly
        // assigning the same hash.
        blueslip.info("ignoring probably-harmless call to browser_history.update: " + new_hash);
        return;
    }

    state.old_hash = old_hash;
    state.is_internal_change = true;
    window.location.hash = new_hash;
}

export function exit_overlay() {
    if (hash_util.is_overlay_hash(window.location.hash)) {
        ui_util.blur_active_element();
        const new_hash = state.hash_before_overlay || "#";
        update(new_hash);
    }
}

export function go_to_location(hash) {
    // Call this function when you WANT the hashchanged
    // function to run.
    window.location.hash = hash;
}

export function update_hash_internally_if_required(hash) {
    if (window.location.hash !== hash) {
        update(hash);
    }
}
