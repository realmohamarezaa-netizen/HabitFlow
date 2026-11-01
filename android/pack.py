#!/usr/bin/env python3
"""Repackage APK: keep aapt2-linked resources, add assets/ + classes.dex.
Forces resources.arsc to be stored uncompressed (required for targetSdk 30+)."""
import os
import sys
import zipfile


def main():
    src, dex, assets_dir, dst = sys.argv[1:5]

    with zipfile.ZipFile(src, "r") as zin, zipfile.ZipFile(dst, "w") as zout:
        for name in zin.namelist():
            info = zin.getinfo(name)
            ct = info.compress_type
            if name == "resources.arsc":
                ct = zipfile.ZIP_STORED
            ni = zipfile.ZipInfo(name, date_time=info.date_time)
            ni.compress_type = ct
            ni.external_attr = info.external_attr
            zout.writestr(ni, zin.read(name))

        for root, _dirs, files in os.walk(assets_dir):
            for f in sorted(files):
                full = os.path.join(root, f)
                rel = os.path.relpath(full, assets_dir)
                arc = "assets/" + rel.replace(os.sep, "/")
                zout.write(full, arc)

        zout.write(dex, "classes.dex")

    print("packed ->", dst)


if __name__ == "__main__":
    main()
