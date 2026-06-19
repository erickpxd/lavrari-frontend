---
description: Cria formulário React Hook Form + Zod com validação
argument-hint: [NomeFormulário] [campos ou endpoint alvo]
allowed-tools: Read, Write, Edit
---

Crie o formulário `$ARGUMENTS` seguindo os padrões Lavrari.

## Antes de criar

Leia os arquivos existentes:
- `src/lib/types.ts` — tipos do backend para inferir o schema Zod
- Formulários similares em `src/components/` para manter consistência
- O endpoint alvo no CLAUDE.md para saber os campos obrigatórios e opcionais

## Stack obrigatória

- **React Hook Form** (`useForm`, `Controller`, `FormProvider`)
- **Zod** para schema de validação (`z.object(...)`)
- **shadcn/ui** para inputs: `Input`, `Select`, `Textarea`, `Switch`, `DatePicker`
- **Lucide React** para ícones nos campos

## Padrão de formulário

```tsx
const schema = z.object({
  campo: z.string().min(2, "Mínimo 2 caracteres"),
  // refletir exatamente as validações do backend
})

type FormData = z.infer<typeof schema>

export function NomeForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { campo: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="campo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />  {/* erro Zod automático */}
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  )
}
```

## Validações Lavrari (espelhar backend)

- Strings obrigatórias: `z.string().min(1)` ou `z.string().min(2/3)` conforme backend
- Email: `z.string().email()`
- Senha: `z.string().min(6)`
- Números inteiros positivos: `z.number().int().positive()`
- Datetime ISO: `z.string().datetime()` ou `z.date()`
- Opcionais: `z.string().optional()` ou `z.string().nullable()`
- Enums: usar `z.enum([...])` com os valores exatos do backend

## UX obrigatória

- Validação em tempo real (modo `onChange`)
- Botão submit desabilitado durante `isSubmitting`
- Feedback de erro por campo via `FormMessage` (não toast)
- Toast apenas para sucesso/erro da API (não de validação)
- Áreas de toque mínimo 56px — inputs com `className="h-14"` em mobile
- Label sempre visível (não placeholder como único label)

## Entregue

Componente de formulário completo, pronto para ser importado na página e conectado à mutation do TanStack Query.
