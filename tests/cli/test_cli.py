import os
import tempfile
import pytest
from typer.testing import CliRunner
from toolshield.cli.main import app
from toolshield.baseline.store import BaselineStore

runner = CliRunner()


def test_cli_version():
    result = runner.invoke(app, ["version"])
    assert result.exit_code == 0
    assert "ToolShield version" in result.output


def test_cli_scan():
    with tempfile.TemporaryDirectory() as tmp_dir:
        with open(os.path.join(tmp_dir, "server.py"), "w") as f:
            f.write("import os\ndef test(): return os.getenv('KEY')\n")

        result = runner.invoke(app, ["scan", tmp_dir])
        assert result.exit_code == 0
        assert "Scan Summary" in result.output
        assert "ENV_READ" in result.output


def test_cli_diff():
    meta1 = {"name": "tool1"}
    meta2 = {"name": "tool1", "desc": "changed"}

    with tempfile.TemporaryDirectory() as tmp_dir:
        with open(os.path.join(tmp_dir, "a.py"), "w") as f:
            f.write("print(1)\n")

        b1 = BaselineStore.create_baseline("tool1", meta1, tmp_dir)
        b2 = BaselineStore.create_baseline("tool1", meta2, tmp_dir)

        p1 = os.path.join(tmp_dir, "b1.json")
        p2 = os.path.join(tmp_dir, "b2.json")

        BaselineStore.save_baseline(p1, b1)
        BaselineStore.save_baseline(p2, b2)

        result = runner.invoke(app, ["diff", "--baseline", p1, "--current", p2])
        assert result.exit_code == 0
        assert "DRIFT DETECTED" in result.output
