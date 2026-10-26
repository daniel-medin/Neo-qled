"""Create an unsigned Tizen web package for installation/signing tools."""

from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parent
FILES = ("config.xml", "index.html", "styles.css", "app.js", "launcher-mm.png")


def main() -> None:
    widget = ElementTree.parse(ROOT / "config.xml").getroot()
    output = ROOT / "dist" / f"MedinsMediacenter-{widget.attrib['version']}.wgt"
    output.parent.mkdir(exist_ok=True)
    with ZipFile(output, "w", compression=ZIP_DEFLATED) as package:
        for name in FILES:
            package.write(ROOT / name, arcname=name)
        for logo in sorted((ROOT / "assets" / "logos").glob("*.png")):
            package.write(logo, arcname=logo.relative_to(ROOT).as_posix())
    print(output)


if __name__ == "__main__":
    main()
