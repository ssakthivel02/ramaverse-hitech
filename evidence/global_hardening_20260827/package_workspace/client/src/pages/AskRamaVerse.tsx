import Intelligence from "@/pages/Intelligence";

/**
 * `/ask` remains the public, discoverable route for Ask RamaVerse.
 * The implementation is intentionally shared with `/intelligence` so both
 * entry points use the same canonical-only resolver, provenance contract,
 * offline cache, language handling, and accessible controls.
 */
export default Intelligence;
