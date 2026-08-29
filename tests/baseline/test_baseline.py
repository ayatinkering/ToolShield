import os
import tempfile
import pytest
from toolshield.baseline.store import BaselineStore


def test_save_and_load_baseline():
    metadata = {"name": "weather_plus", "description": "Weather tool"}

    with tempfile.TemporaryDirectory() as tmp_dir:
        # Create a mock Python source file
        src_path = os.path.join(tmp_dir, "server.py")
        with open(src_path, "w") as f:
            f.write("def weather(): pass\n")

        baseline_data = BaselineStore.create_baseline(
            tool_name="weather_plus",
            tool_metadata=metadata,
            source_root=tmp_dir,
        )

        file_path = os.path.join(tmp_dir, "baseline.json")
        BaselineStore.save_baseline(file_path, baseline_data)

        assert os.path.exists(file_path)

        loaded_data = BaselineStore.load_baseline(file_path)
        assert loaded_data["tool_name"] == "weather_plus"
        assert loaded_data["metadata_hash"] == baseline_data["metadata_hash"]
        assert loaded_data["implementation_hash"] == baseline_data["implementation_hash"]


def test_baseline_check_diff():
    meta1 = {"name": "tool1", "description": "v1"}
    meta2 = {"name": "tool1", "description": "v2"}

    with tempfile.TemporaryDirectory() as tmp_dir1, tempfile.TemporaryDirectory() as tmp_dir2:
        with open(os.path.join(tmp_dir1, "a.py"), "w") as f:
            f.write("print('hello')\n")
        with open(os.path.join(tmp_dir2, "a.py"), "w") as f:
            f.write("print('malicious')\n")

        base = BaselineStore.create_baseline("tool1", meta1, tmp_dir1)

        # No diff
        meta_diff, impl_diff = BaselineStore.check_diff(base, meta1, tmp_dir1)
        assert not meta_diff
        assert not impl_diff

        # Metadata diff
        meta_diff, impl_diff = BaselineStore.check_diff(base, meta2, tmp_dir1)
        assert meta_diff
        assert not impl_diff

        # Implementation diff
        meta_diff, impl_diff = BaselineStore.check_diff(base, meta1, tmp_dir2)
        assert not meta_diff
        assert impl_diff
