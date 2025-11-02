// src/app/page.tsx
import Link from 'next/link';
import { 
  Zap, 
  BarChart3, 
  Package, 
  Wallet, 
  Smartphone, 
  CheckCircle2,
  Store,
  Truck,
  ShoppingBag,
  Palette,
  Coffee,
  Box,
  MessageCircle,
  Sparkles,
  ShoppingCart,
  Users,
  MapPin,
  CreditCard
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-white text-black antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-sm"></div>
            <span className="font-black text-xl tracking-tight">POSFER</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-black/70">
            <a href="#funcionalidades" className="hover:text-black transition">Funcionalidades</a>
            <a href="#beneficios" className="hover:text-black transition">Beneficios</a>
            <a href="#precio" className="hover:text-black transition">Precio</a>
            <a href="https://wa.me/56966416942?text=Hola%20Posfer%2C%20tengo%20dudas..." className="hover:text-black transition">WhatsApp</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:inline-block px-4 py-2 text-[15px] font-semibold text-black/70 hover:text-black transition">
              Entrar
            </Link>
            <Link href="/register" className="px-5 py-2.5 rounded-xl bg-amber-400 text-black text-[15px] font-bold hover:bg-amber-500 transition shadow-sm">
              Prueba gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto max-w-7xl px-4 pt-16 md:pt-28 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-900 mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Sin computador ni papeles
          </div>
          
         <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-8">
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Controla tu negocio</span><br/>
            desde tu celular
          </h1>
          

          <div className="relative max-w-3xl mx-auto mb-10">
         
            <div className="absolute inset-0 bg-amber-400/10 blur-2xl"></div>
            
     
            <div className="relative backdrop-blur-sm bg-gradient-to-r from-amber-50/80 to-amber-100/80 border border-amber-200/60 rounded-2xl px-6 md:px-10 py-5 shadow-lg">
              <p className="text-base md:text-lg text-black/70 font-medium leading-relaxed text-center">
                Sistema de ventas CREADO para
              </p>
              <p className="text-xl md:text-2xl text-amber-800 font-bold text-center mt-1">
                Comerciantes Minoristas y Trabajadores Independientes
              </p>
            </div>
          </div>
  

          <p className="text-base md:text-lg text-black/60 font-medium max-w-2xl mx-auto mb-10">
            Fácil de usar, sin complicaciones ni mensualidades caras
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-black text-white text-lg font-bold hover:bg-black/90 transition shadow-lg shadow-black/10">
              Comenzar gratis →
            </Link>
            <a href="https://wa.me/56966416942?text=Hola%20Posfer%2C%20tengo%20dudas..." className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-black/10 hover:border-black/20 text-lg font-semibold transition">
              Hablar por WhatsApp
            </a>
          </div>
          
          <p className="text-sm text-black/50 flex items-center justify-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-amber-600" strokeWidth={2.5} />
              14 días gratis
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-amber-600" strokeWidth={2.5} />
              Sin tarjeta
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-amber-600" strokeWidth={2.5} />
              Cancela cuando quieras
            </span>
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto max-w-7xl px-4 pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-black/50 uppercase tracking-wider mb-10">Hecho para</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { Icon: Store, text: 'Ferias libres', gradient: 'from-amber-400 to-orange-500' },
              { Icon: Truck, text: 'Food trucks', gradient: 'from-amber-500 to-red-500' },
              { Icon: ShoppingBag, text: 'Almacenes', gradient: 'from-yellow-400 to-amber-500' },
              { Icon: Palette, text: 'Artesanos', gradient: 'from-orange-400 to-pink-500' },
              { Icon: Coffee, text: 'Kioscos', gradient: 'from-amber-600 to-orange-600' },
              { Icon: Box, text: 'Emprendedores', gradient: 'from-yellow-500 to-amber-600' },
            ].map((item) => {
              const IconComponent = item.Icon;
              return (
                <div key={item.text} className="group relative">
                  {/* Glow effect */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-300`}></div>
                  
                  {/* Card */}
                  <div className="relative p-8 rounded-2xl bg-white border-2 border-black/5 hover:border-amber-200 transition-all duration-300 hover:shadow-xl">
                    <div className="flex flex-col items-center gap-4">
                      {/* Icon container */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>
                      {/* Text */}
                      <div className="font-bold text-base text-black/90 text-center">{item.text}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="bg-gradient-to-b from-white to-amber-50/30 py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Todo lo que necesitas en un solo lugar</h2>
            <p className="text-xl text-black/70">Gestiona tu negocio completo desde tu celular</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                Icon: ShoppingCart,
                title: 'Punto de Venta',
                desc: 'Registra ventas en segundos. Selecciona productos, cobra con múltiples medios de pago y listo.',
                color: 'from-amber-400 to-orange-500'
              },
              {
                Icon: Package,
                title: 'Control de Inventario',
                desc: 'Gestiona productos, variedades y precios. Actualización automática de stock con cada venta.',
                color: 'from-orange-400 to-red-500'
              },
              {
                Icon: ShoppingBag,
                title: 'Registro de Compras',
                desc: 'Registra tus compras a proveedores y decide qué productos poner a la venta.',
                color: 'from-yellow-400 to-amber-500'
              },
              {
                Icon: Wallet,
                title: 'Control de Caja',
                desc: 'Abre y cierra caja con resumen completo. Controla ingresos y detecta diferencias al cierre.',
                color: 'from-amber-500 to-yellow-600'
              },
              {
                Icon: BarChart3,
                title: 'Historial de Ventas',
                desc: 'Revisa ventas pasadas con calendario interactivo. Filtra por fecha y método de pago.',
                color: 'from-orange-500 to-amber-600'
              },
              {
                Icon: Users,
                title: 'Gestión de Proveedores',
                desc: 'Mantén un registro organizado de tus proveedores y sus productos.',
                color: 'from-amber-600 to-orange-500'
              },
              {
                Icon: MapPin,
                title: 'Múltiples Ubicaciones',
                desc: 'Administra varios puntos de venta desde una sola cuenta.',
                color: 'from-yellow-500 to-amber-500'
              },
              {
                Icon: CreditCard,
                title: 'Múltiples Medios de Pago',
                desc: 'Acepta efectivo, débito, crédito y transferencias. Todo registrado y organizado.',
                color: 'from-amber-400 to-yellow-500'
              },
              {
                Icon: Smartphone,
                title: '100% en tu Celular',
                desc: 'No necesitas computador, tablet ni equipos costosos. Solo tu celular y listo.',
                color: 'from-orange-400 to-amber-500'
              },
            ].map((feature) => {
              const IconComponent = feature.Icon;
              return (
                <div 
                  key={feature.title}
                  className="group p-6 rounded-2xl bg-white border-2 border-black/5 hover:border-amber-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-black">{feature.title}</h3>
                  <p className="text-black/60 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link 
              href="/register"
              className="inline-block px-8 py-4 rounded-xl bg-black text-white text-lg font-bold hover:bg-black/90 transition shadow-lg"
            >
              Probar todas las funcionalidades gratis →
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="bg-black text-white py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">¿Por qué POSFER?</h2>
            <p className="text-xl text-white/70">Todo lo que necesitas para manejar tu negocio, nada más</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { Icon: Zap, title: 'Cobra en segundos', desc: 'Agrega productos, cobra y listo. Sin pantallas complicadas ni procesos largos.', gradient: 'from-yellow-400 to-amber-500' },
              { Icon: BarChart3, title: 'Ve cuánto ganas', desc: 'Sabe al instante cuánto vendiste hoy, esta semana o este mes. Todo claro.', gradient: 'from-amber-400 to-orange-500' },
              { Icon: Package, title: 'Controla tu stock', desc: 'Sabe qué te queda, qué se vende más y cuándo pedir más productos.', gradient: 'from-orange-400 to-amber-600' },
              { Icon: Wallet, title: 'Caja ordenada', desc: 'Abre y cierra caja con todo registrado. Nunca más dudas al final del día.', gradient: 'from-amber-500 to-yellow-500' },
              { Icon: Smartphone, title: '100% móvil', desc: 'Todo desde tu celular. No necesitas computador, tablet ni nada extra.', gradient: 'from-yellow-500 to-amber-400' },
              { Icon: MessageCircle, title: 'Fácil como WhatsApp', desc: 'Si sabes usar WhatsApp, sabes usar POSFER. Sin manuales ni capacitaciones.', gradient: 'from-amber-400 to-orange-400', highlight: true },
            ].map((benefit) => {
              const IconComponent = benefit.Icon;
              return (
                <div 
                  key={benefit.title} 
                  className={`group relative p-8 rounded-3xl transition-all duration-300 ${
                    benefit.highlight 
                      ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-2 border-amber-400/50 hover:border-amber-400' 
                      : 'bg-white/5 border-2 border-white/10 hover:border-amber-400/50'
                  }`}
                >
                  {/* Glow effect on hover */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${benefit.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition duration-500`}></div>
                  
                  {/* Content */}
                  <div className="relative">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} shadow-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                    
                    {/* Text */}
                    <h3 className="text-2xl font-bold mb-3 text-white">{benefit.title}</h3>
                    <p className="text-white/70 leading-relaxed">{benefit.desc}</p>
                    
                    {benefit.highlight && (
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400">MÁS FÁCIL IMPOSIBLE</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precio" className="container mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Precio transparente</h2>
            <p className="text-xl text-black/70">Sin contratos ni sorpresas. Cancela cuando quieras.</p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-amber-500 rounded-3xl blur-xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl p-8 md:p-12 text-black">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/10 text-sm font-bold mb-4">
                    <Sparkles className="w-4 h-4" strokeWidth={3} />
                    Oferta de lanzamiento
                  </div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-5xl md:text-6xl font-black">$9.900</span>
                    <span className="text-2xl font-bold">/ mes</span>
                  </div>
                  <p className="text-lg font-semibold mb-1">Antes <span className="line-through opacity-70">$14.900</span></p>
                  <p className="text-black/80">Solo para los primeros 300 negocios · Después vuelve a precio normal</p>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-black" strokeWidth={3} />
                      </div>
                      <span className="font-semibold">14 días gratis para probar</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-black" strokeWidth={3} />
                      </div>
                      <span className="font-semibold">Sin contrato, cancela cuando quieras</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-black" strokeWidth={3} />
                      </div>
                      <span className="font-semibold">Todas las funciones incluidas</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Link href="/register" className="px-8 py-4 rounded-xl bg-black text-white text-center text-lg font-bold hover:bg-black/90 transition shadow-xl whitespace-nowrap">
                    Comenzar gratis
                  </Link>
                  <a href="https://wa.me/56966416942?text=Hola%20Posfer%2C%20tengo%20dudas..." className="px-8 py-4 rounded-xl border-2 border-black/20 hover:border-black/40 text-center text-lg font-semibold transition whitespace-nowrap">
                    Hablar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-black text-white py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">¿Listo para ordenar tu negocio?</h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Únete a los vendedores de ferias libres y pequeños negocios que ya están vendiendo más rápido y controlando mejor sus ventas.
          </p>
          <Link href="/register" className="inline-block px-10 py-5 rounded-xl bg-amber-400 text-black text-lg font-bold hover:bg-amber-500 transition shadow-xl">
            Probar POSFER gratis →
          </Link>
          <p className="mt-4 text-sm text-white/50">Sin tarjeta · Listo en 3 minutos</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500"></div>
              <span className="font-black text-lg">POSFER</span>
            </div>
            <p className="text-sm text-black/60 text-center">
              © 2025 POSFER · Hecho con ❤️ para vendedores de ferias libres y emprendedores
            </p>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link href="/login" className="text-black/60 hover:text-black transition">Entrar</Link>
              <Link href="/register" className="text-black/60 hover:text-black transition">Crear cuenta</Link>
              <a href="https://wa.me/56966416942?text=Hola%20Posfer%2C%20tengo%20dudas..." className="text-black/60 hover:text-black transition">WhatsApp</a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a 
        href="https://wa.me/56966416942?text=Hola%20Posfer%2C%20tengo%20dudas..." 
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Contactar por WhatsApp"
      >
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 animate-pulse transition"></div>
        
        {/* Button */}
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
          <MessageCircle className="w-8 h-8 text-white" strokeWidth={2.5} fill="white" />
        </div>
      </a>
    </div>
  );
}
