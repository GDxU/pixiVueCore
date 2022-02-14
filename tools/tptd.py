# !/usr/bin/env python
# coding: utf-8
import glob
import json
import os
import sys


def WriteFile(content, filename: str):
    fo = open(filename, "w")
    fo.write(content)
    fo.close()


globString = sys.argv[1] + "/*.json"
frameList = glob.glob(globString)
fileItems = []

for frame in frameList:
    f = os.path.splitext(frame)[0]
    h = f.split("/")
    name = h[len(h) - 1]
    fileItems.append({
        "name": name,
        "data": "statics/" + name + ".json",
        "url": "statics/" + name + ".png"
    })

print(fileItems)
WriteFile(json.dumps(fileItems, ensure_ascii=False), sys.argv[2])

T1JS = """
//---------------------------AUTO GEN FUNCTION
export function ___assetList(res) {{
    {CONTEXT}
    return {{
    {PARAMS}
    }};
}}
 
"""

T2 = """
const {NAME} = res.{NAME}.textures;"""
T3 = "{NAME},"


def wrapContent(list_items, list_params) -> str:
    return T1JS.format(
        CONTEXT="\n".join(list_items),
        PARAMS="".join(list_params)
    )


TList = []
PLIST = []
for p in fileItems:
    TList.append(T2.format(NAME=p["name"]))
    PLIST.append(T3.format(NAME=p["name"]))

# print(wrapContent(TList))
WriteFile(wrapContent(TList, PLIST), sys.argv[3])
