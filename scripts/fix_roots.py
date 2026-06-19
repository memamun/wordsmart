import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")

def main():
    core_path = os.path.join(DATA_DIR, "core_vocabulary.json")
    roots_path = os.path.join(DATA_DIR, "word_roots.json")

    with open(core_path, "r", encoding="utf-8") as f:
        core_data = json.load(f)

    with open(roots_path, "r", encoding="utf-8") as f:
        roots_data = json.load(f)

    # 1. Modify root definitions and meanings in word_roots.json
    roots_list = roots_data.get("roots", [])
    new_roots = []

    # Map to track root by name
    roots_by_name = {}
    for r in roots_list:
        roots_by_name[r["root"]] = r

    # Perform updates/renames
    # Rename SUA to SUAV/SUAS
    if "SUA" in roots_by_name:
        sua_root = roots_by_name.pop("SUA")
        sua_root["root"] = "SUAV/SUAS"
        sua_root["meaning"] = "sweet; to advise, to urge"
        roots_by_name["SUAV/SUAS"] = sua_root

    # Update meanings of other roots
    if "CAST/CHAST" in roots_by_name:
        roots_by_name["CAST/CHAST"]["meaning"] = "pure, chaste"
    if "PER" in roots_by_name:
        roots_by_name["PER"]["meaning"] = "through, thoroughly, completely, wrongly"
    if "PRO" in roots_by_name:
        roots_by_name["PRO"]["meaning"] = "forward, forth, before, in favor of"

    # Remove BE root entirely
    if "BE" in roots_by_name:
        roots_by_name.pop("BE")

    # Define new roots that we need to add if not present
    new_root_defs = {
        "HOMO": {"root": "HOMO", "meaning": "same, alike", "words": ["homogeneous", "homonym", "homosexual", "homeostasis"]},
        "HETERO": {"root": "HETERO", "meaning": "other, different", "words": ["heterosexual", "heterogeneous", "heterodox"]},
        "MON/MONIT": {"root": "MON/MONIT", "meaning": "to warn, to advise, to remind", "words": ["admonish"]},
        "MONSTR": {"root": "MONSTR", "meaning": "to show", "words": ["remonstrate"]},
        "GEN": {"root": "GEN", "meaning": "birth, class, kin", "words": ["homogeneous", "heterogeneous", "indigenous"]},
        "SAP/SIP": {"root": "SAP/SIP", "meaning": "to taste, to be wise", "words": ["insipid"]}
    }

    for name, rdef in new_root_defs.items():
        if name not in roots_by_name:
            roots_by_name[name] = rdef
        else:
            # Union words
            existing_words = set(roots_by_name[name].get("words", []))
            existing_words.update(rdef["words"])
            roots_by_name[name]["words"] = list(existing_words)

    # 2. Modify core_vocabulary.json word root_tags explicitly
    words = core_data.get("words", [])
    words_by_name = {w["word"].upper(): w for w in words}

    # Explicit etymological removals/corrections per word
    EXPLICIT_CHANGES = {
        "ADMONISH": {
            "remove": ["MAN"],
            "add": [("MON/MONIT", "to warn, to advise, to remind")]
        },
        "ANOMALY": {
            "remove": ["HER/HES"],
            "add": []
        },
        "APARTHEID": {
            "remove": ["AB/ABS", "PAR"],
            "add": []
        },
        "ASSUAGE": {
            "remove": ["SUA"],
            "add": [("SUAV/SUAS", "sweet; to advise, to urge")]
        },
        "SUAVE": {
            "remove": ["SUA"],
            "add": [("SUAV/SUAS", "sweet; to advise, to urge")]
        },
        "PERSUADE": {
            "remove": ["SUA"],
            "add": [("SUAV/SUAS", "sweet; to advise, to urge")]
        },
        "DISSUADE": {
            "remove": ["SUA"],
            "add": [("SUAV/SUAS", "sweet; to advise, to urge")]
        },
        "BELIE": {
            "remove": ["BE"],
            "add": []
        },
        "BELITTLE": {
            "remove": ["BE"],
            "add": []
        },
        "BESET": {
            "remove": ["BE"],
            "add": []
        },
        "COVERT": {
            "remove": ["VERS/VERT"],
            "add": []
        },
        "DEMAGOGUE": {
            "remove": ["ACT/AG"],
            "add": []
        },
        "HOMOGENEOUS": {
            "remove": ["HER/HES"],
            "add": [
                ("HOMO", "same, alike"),
                ("GEN", "birth, class, kin")
            ]
        },
        "INDIGENT": {
            "remove": ["IM/IN"],
            "add": []
        },
        "INDIGENOUS": {
            "remove": ["IM/IN/EM/EN"],
            "add": [("GEN", "birth, class, kin")]
        },
        "INSIPID": {
            "remove": ["IM/IN"],
            "add": [("SAP/SIP", "to taste, to be wise")]
        },
        "INSOLENT": {
            "remove": ["SAL/SIL/SAULT/SULT"],
            "add": []
        },
        "JUXTAPOSE": {
            "remove": ["JOIN/JUNCT"],
            "add": []
        },
        "MATRICULATE": {
            "remove": ["MATER/MATR"],
            "add": []
        },
        "OBFUSCATE": {
            "remove": ["OB/OC/OF/OP"],
            "add": []
        },
        "OBLIQUE": {
            "remove": ["OB/OC/OF/OP"],
            "add": []
        },
        "OBSCURE": {
            "remove": ["OB/OC/OF/OP"],
            "add": []
        },
        "OBTUSE": {
            "remove": ["OB/OC/OF/OP"],
            "add": []
        },
        "PROSELYTIZE": {
            "remove": ["PRO"],
            "add": []
        },
        "PRODIGIOUS": {
            "remove": ["PRO"],
            "add": []
        },
        "PRODIGY": {
            "remove": ["PRO"],
            "add": []
        },
        "QUERULOUS": {
            "remove": ["QUE/QUIS"],
            "add": []
        },
        "REMONSTRATE": {
            "remove": ["MAN"],
            "add": [("MONSTR", "to show")]
        },
        "STEADFAST": {
            "remove": ["STA/STI"],
            "add": []
        },
        "SUBLIME": {
            "remove": ["SUB/SUP"],
            "add": []
        },
        "SUBTLE": {
            "remove": ["SUB/SUP"],
            "add": []
        },
        "VICARIOUS": {
            "remove": ["VI"],
            "add": []
        }
    }

    # Apply explicit changes in core_vocabulary.json
    for word_name, changes in EXPLICIT_CHANGES.items():
        if word_name in words_by_name:
            w = words_by_name[word_name]
            rt = w.get("root_tags", [])
            
            # Remove specified roots
            rt = [r for r in rt if r["root"] not in changes["remove"]]
            
            # Add specified roots
            for add_root, add_meaning in changes["add"]:
                # avoid duplicates
                if not any(r["root"] == add_root for r in rt):
                    rt.append({"root": add_root, "meaning": add_meaning})
            
            w["root_tags"] = rt

    # Update meanings of modified roots in all words in core_vocabulary.json
    for w in words:
        rt = w.get("root_tags", [])
        for r in rt:
            rname = r["root"]
            if rname in roots_by_name:
                r["meaning"] = roots_by_name[rname]["meaning"]

    # 3. Synchronize core_vocabulary.json and word_roots.json
    # Step A: From core_vocabulary to word_roots
    for w in words:
        wname = w["word"].lower()
        rt = w.get("root_tags", [])
        for r in rt:
            rname = r["root"]
            if rname in roots_by_name:
                wlist = roots_by_name[rname].get("words", [])
                if wname not in wlist:
                    wlist.append(wname)
                roots_by_name[rname]["words"] = wlist

    # Step B: Clean up words in word_roots and sync back to core
    keys_to_delete = []
    for rname, r in roots_by_name.items():
        wlist = r.get("words", [])
        cleaned_wlist = []
        for wname in wlist:
            wname_upper = wname.upper()
            
            # Check if this word was explicitly removed from this root
            if wname_upper in EXPLICIT_CHANGES:
                if rname in EXPLICIT_CHANGES[wname_upper]["remove"]:
                    continue  # Skip, it was removed

            # Make sure it exists in core_vocabulary with this root
            if wname_upper in words_by_name:
                rt = words_by_name[wname_upper].get("root_tags", [])
                if any(tag["root"] == rname for tag in rt):
                    cleaned_wlist.append(wname)
            else:
                # If word is not in core_vocabulary, keep it (extra examples in word_roots)
                cleaned_wlist.append(wname)

        # Deduplicate and sort
        cleaned_wlist = sorted(list(set(cleaned_wlist)))
        r["words"] = cleaned_wlist
        
        if not cleaned_wlist:
            keys_to_delete.append(rname)

    # Delete empty roots
    for k in keys_to_delete:
        roots_by_name.pop(k)

    # Update roots_data list
    sorted_roots = sorted(roots_by_name.values(), key=lambda x: x["root"])
    roots_data["roots"] = sorted_roots
    roots_data["total_roots"] = len(sorted_roots)

    # 4. Save both files
    with open(core_path, "w", encoding="utf-8") as f:
        json.dump(core_data, f, indent=2, ensure_ascii=False)

    with open(roots_path, "w", encoding="utf-8") as f:
        json.dump(roots_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Successfully corrected and synchronized roots databases!")
    print(f"Total roots now: {len(sorted_roots)}")

if __name__ == "__main__":
    main()
