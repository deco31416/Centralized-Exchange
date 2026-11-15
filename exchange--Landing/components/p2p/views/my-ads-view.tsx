
import { useState, useEffect } from "react";
import { useMyAds } from "@/hooks/p2p/use-my-ads";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { P2PAdsService, P2PAssetsService } from "@/services/P2PService";

const FIAT_OPTIONS = ["MXN", "USD", "COP", "EUR", "BRL"]

export default function MyAdsView() {
  const { data: ads, isLoading, error, refetch } = useMyAds();
  const { toast } = useToast();
  const [modal, setModal] = useState<null | "create" | { type: "edit"; ad: any } | { type: "delete"; ad: any } | { type: "toggle"; ad: any }>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [assetCatalog, setAssetCatalog] = useState<{ assetCode: string; symbol: string }[]>([]);

  useEffect(() => {
    P2PAssetsService.listAssetCatalog()
      .then((items) => setAssetCatalog(items))
      .catch(() => {})
  }, []);

  // Handlers CRUD
  const handleOpenCreate = () => {
    setForm({ type: "sell", crypto: "USDT", fiat: "MXN", price: 0, available: 0, methods: [] });
    setModal("create");
  };
  const handleOpenEdit = (ad: any) => {
    setForm({ ...ad });
    setModal({ type: "edit", ad });
  };
  const handleOpenDelete = (ad: any) => setModal({ type: "delete", ad });
  const handleOpenToggle = (ad: any) => setModal({ type: "toggle", ad });

  const handleCloseModal = () => {
    setModal(null);
    setForm({});
  };

  const handleChange = (e: any) => {
    setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await P2PAdsService.createAd(form);
      toast({ title: "Anuncio creado" });
      handleCloseModal();
      refetch();
    } catch (err: any) {
      toast({ title: "Error al crear anuncio", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = async () => {
    setLoading(true);
    try {
      await P2PAdsService.updateAd(form.id, form);
      toast({ title: "Anuncio actualizado" });
      handleCloseModal();
      refetch();
    } catch (err: any) {
      toast({ title: "Error al editar anuncio", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    setLoading(true);
    try {
      await P2PAdsService.deleteAd((modal as any).ad.id);
      toast({ title: "Anuncio eliminado" });
      handleCloseModal();
      refetch();
    } catch (err: any) {
      toast({ title: "Error al eliminar anuncio", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const handleToggle = async () => {
    setLoading(true);
    try {
      await P2PAdsService.toggleStatus((modal as any).ad.id, !((modal as any).ad.status === "active"));
      toast({ title: "Estado actualizado" });
      handleCloseModal();
      refetch();
    } catch (err: any) {
      toast({ title: "Error al cambiar estado", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Mis Anuncios</h1>
        <p className="text-muted-foreground">
          Aquí podrás crear, editar y gestionar tus anuncios de compra y venta de criptomonedas.
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <Button variant="default" className="gap-2" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" /> Crear anuncio
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="w-full h-32 rounded-md" />
      ) : error ? (
        <div className="text-destructive">Error al cargar anuncios: {error.message}</div>
      ) : ads.length === 0 ? (
        <div className="text-muted-foreground text-center py-12">No tienes anuncios publicados.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Cripto</TableHead>
                <TableHead>Fiat</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Métodos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <Badge variant={ad.type === "buy" ? "secondary" : "outline"}>
                      {ad.type === "buy" ? "Compra" : "Venta"}
                    </Badge>
                  </TableCell>
                  <TableCell>{ad.crypto.toUpperCase()}</TableCell>
                  <TableCell>{ad.fiat.toUpperCase()}</TableCell>
                  <TableCell>$ {ad.price.toFixed(2)}</TableCell>
                  <TableCell>{ad.available}</TableCell>
                  <TableCell>
                    {ad.methods && ad.methods.length > 0 ? ad.methods.join(", ") : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ad.status === "active" ? "default" : "outline"}>{ad.status}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleOpenEdit(ad)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => handleOpenDelete(ad)}><Trash2 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => handleOpenToggle(ad)}>{ad.status === "active" ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Dialog open={!!(modal === "create" || (modal && (modal as any).type === "edit"))} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{modal === "create" ? "Crear anuncio" : "Editar anuncio"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={form.crypto || ""} onValueChange={(v) => setForm((f: any) => ({ ...f, crypto: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona cripto" />
              </SelectTrigger>
              <SelectContent>
                {assetCatalog.length > 0
                  ? assetCatalog.map((a) => (
                      <SelectItem key={a.assetCode} value={a.assetCode}>
                        {a.symbol || a.assetCode}
                      </SelectItem>
                    ))
                  : ["USDT", "BTC", "ETH"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
              </SelectContent>
            </Select>
            <Select value={form.fiat || ""} onValueChange={(v) => setForm((f: any) => ({ ...f, fiat: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona moneda fiat" />
              </SelectTrigger>
              <SelectContent>
                {FIAT_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input name="price" placeholder="Precio" type="number" value={form.price || ""} onChange={handleChange} />
            <Input name="available" placeholder="Disponible" type="number" value={form.available || ""} onChange={handleChange} />
            <Input name="methods" placeholder="Métodos (coma)" value={form.methods ? form.methods.join ? form.methods.join(",") : form.methods : ""} onChange={e => setForm((f: any) => ({ ...f, methods: e.target.value.split(",") }))} />
          </div>
          <DialogFooter>
            <Button onClick={handleCloseModal} variant="outline">Cancelar</Button>
            <Button onClick={modal === "create" ? handleCreate : handleEdit} disabled={loading}>
              {modal === "create" ? "Crear" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={!!modal && (modal as any).type === "delete"} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Eliminar anuncio</DialogTitle>
          </DialogHeader>
          <div className="py-4">¿Seguro que deseas eliminar este anuncio?</div>
          <DialogFooter>
            <Button onClick={handleCloseModal} variant="outline">Cancelar</Button>
            <Button onClick={handleDelete} disabled={loading} variant="destructive">Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Activar/Desactivar */}
      <Dialog open={!!modal && (modal as any).type === "toggle"} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>{(modal as any)?.ad?.status === "active" ? "Desactivar" : "Activar"} anuncio</DialogTitle>
          </DialogHeader>
          <div className="py-4">¿Seguro que deseas {(modal as any)?.ad?.status === "active" ? "desactivar" : "activar"} este anuncio?</div>
          <DialogFooter>
            <Button onClick={handleCloseModal} variant="outline">Cancelar</Button>
            <Button onClick={handleToggle} disabled={loading}>{(modal as any)?.ad?.status === "active" ? "Desactivar" : "Activar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

