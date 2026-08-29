import json
import os
import hashlib
from typing import Dict, Any, Tuple, Optional


class BaselineStore:
    """Manages metadata and implementation hashes for rug-pull detection."""

    @staticmethod
    def compute_metadata_hash(tool_metadata: Dict[str, Any]) -> str:
        """Compute canonical SHA-256 hash over tool metadata dict."""
        canonical_json = json.dumps(tool_metadata, sort_keys=True)
        return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()

    @staticmethod
    def compute_implementation_hash(source_root: str) -> str:
        """Compute deterministic SHA-256 hash across sorted Python source files in source_root."""
        hasher = hashlib.sha256()
        for dirpath, dirnames, filenames in os.walk(source_root):
            dirnames.sort()  # Enforce deterministic directory traversal
            for fname in sorted(filenames):
                if fname.endswith(".py"):
                    fpath = os.path.join(dirpath, fname)
                    with open(fpath, "rb") as f:
                        hasher.update(f.read())
        return hasher.hexdigest()

    @classmethod
    def create_baseline(cls, tool_name: str, tool_metadata: Dict[str, Any], source_root: str) -> Dict[str, Any]:
        """Create baseline record for a tool."""
        return {
            "tool_name": tool_name,
            "metadata_hash": cls.compute_metadata_hash(tool_metadata),
            "implementation_hash": cls.compute_implementation_hash(source_root),
        }

    @classmethod
    def check_diff(cls, baseline: Dict[str, Any], current_metadata: Dict[str, Any], current_source_root: str) -> Tuple[bool, bool]:
        """Check baseline vs current state for metadata or implementation drift."""
        meta_changed = cls.compute_metadata_hash(current_metadata) != baseline.get("metadata_hash")
        impl_changed = cls.compute_implementation_hash(current_source_root) != baseline.get("implementation_hash")
        return meta_changed, impl_changed
