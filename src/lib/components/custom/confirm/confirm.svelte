<script lang="ts">
  import { Dialog, DialogContent, DialogFooter, DialogTitle } from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";

  let { onCancel, onConfirm, isOpen } = $props();

  function confirm() {
    onConfirm();
    close();
  }

  function cancel() {
    onCancel();
    close();
  }

  function close() {
    isOpen = false;
  }
</script>

<Dialog bind:open={isOpen} closeOnOutsideClick={false} closeOnEscape={false}>
  <DialogContent>
    <DialogTitle>Confirm action</DialogTitle>
    <p>Are you sure you want to proceed? This action cannot be undone.</p>
    <DialogFooter>
      <Button on:click={cancel} variant="outline">Cancel</Button>
      <Button variant="destructive" on:click={confirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
