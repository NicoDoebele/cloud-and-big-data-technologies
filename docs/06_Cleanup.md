# Cleanup Documentation

## Overview

This document covers the cleanup procedures for the MongoDB sharded cluster infrastructure deployed via Terraform.

## Terraform Cleanup

### Complete Infrastructure Removal

To remove all deployed infrastructure:

```bash
# Destroy all Terraform-managed resources
terraform destroy

# This will remove:
# - OpenStack instances
# - Network resources
# - Security groups
# - Floating IPs
# - Kubernetes cluster
# - MongoDB deployment
# - Twutter application
```

## Manual Cleanup Requirements

### Cinder Volumes

After running `terraform destroy`, Cinder volumes may remain in OpenStack and need manual cleanup:

```bash
# List remaining Cinder volumes
openstack volume list

# Delete specific volumes (if not needed)
openstack volume delete <volume-id>
```

**Note**: Cinder volumes can be manually deleted or reassigned for reuse depending on your use case.

## Verification

### Confirm Cleanup

```bash
# Verify no instances remain
openstack server list

# Verify no volumes remain
openstack volume list

# Verify no networks remain
openstack network list
```
