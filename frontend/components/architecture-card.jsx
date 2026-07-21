"use client"
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import "./architectureCard.css"
import mermaid from 'mermaid';
import { Star, halfStar } from 'lucide-react';
import { Clock4 } from 'lucide-react';
import { DollarSign } from 'lucide-react';
import { FileText } from 'lucide-react';
import { UsersRound } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false, theme: 'base', themeVariables: {
    primaryColor: '#1a1a2e',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#00c896',
    lineColor: '#00c896',
    secondaryColor: '#0f0f1a',
    tertiaryColor: '#111122',
    background: '#0a0a0a',
    mainBkg: '#1a1a2e',
    nodeBorder: '#00c896',
    clusterBkg: '#0f0f1a',
    clusterBorder: '#00c896',
    edgeLabelBackground: '#0a0a0a',
    titleColor: '#ffffff',
    fontSize: '14px'
  }
});


const RenderFields = ({ fields }) => {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return null;

  return (
    <ul className="text-sm ml-4 list-disc">
      {Object.entries(fields).map(([key, value]) => (
        <li key={key}>
          <span className="font-medium">{key}:</span>{" "}
          {Array.isArray(value) ? (
            <ul className="ml-4 list-disc">
              {value.map((item, idx) => (
                <li key={idx}>
                  {typeof item === "object" && item !== null ? (
                    <RenderFields fields={item} />
                  ) : (
                    String(item)
                  )}
                </li>
              ))}
            </ul>
          ) : typeof value === "object" && value !== null ? (
            // Special case: if the object has a "src" key, render it as an image
            value.src ? (
              <img src={value.src} alt={key} className="max-w-xs rounded" />
            ) : (
              <RenderFields fields={value} />
            )
          ) : (
            String(value)
          )}
        </li>
      ))}
    </ul>
  );
};

export function ArchitectureCard({ data }) {

  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!data.diagram) return;

    const code = data.diagram
      .replace(/subgraph (\w+)\[([^\]]*)\]/g, (_, id, label) => {
        const cleanLabel = label.replace(/[()]/g, '');
        return `subgraph ${id}[${cleanLabel}]`;
      });

    mermaid.render('arch-diagram-' + Date.now(), code).then(({ svg }) => {
      containerRef.current.innerHTML = svg;
    }).catch(err => console.error('Mermaid error:', err));
  }, [data.diagram]);

   function Rating({ value }) {
    // value can be float like 3.5
    const fullStars = Math.floor(value);
    const halfStar = value % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    const stars = [];

    // full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} fill="gold" stroke="gold" />);
    }

    // half star (optional: use a different icon or style)
    if (halfStar) {
      stars.push(<halfStar key="half" fill="gold" stroke="gray" />);
    }

    // empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} stroke="gray" />);
    }

    return <div className="flex gap-1">{stars}</div>;
  }


  if (!data || typeof data !== "object") {
    return <p>Invalid data</p>;
  }

  return (
    <>
      <div>
        {data.explanation && data.explanation.length > 0 && (
          <>
            <h3 className="text-[18px] font-semibold ml-1.5 mb-3">
              Why this architecture?
            </h3>

            {/* <div className="flex flex-row flex-wrap justify-start gap-3"> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-3">
              {data.explanation.map((e, i) => (
                <Card className="transition-all duration-250 ease-in-out hover:-translate-y-0.5 hover:scale-102 hover:shadow-green-500 hover:border-accent cursor-pointer animate-slideUp" style={{ animationDelay: `${i * 0.15}s` }} key={i}>
                  <CardContent className="sm:px-6 px-5">
                    <div className="mb-2" key={i}>
                      <strong className="text-[15px]"> • {e.title}</strong>
                      <p className="ml-2.5 text-[#f5f5f5d6] text-[14px]">{e.reason}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </>
        )}
      </div>

      {data.diagram && (
        <div className="mb-12">
          <h3 className="text-xl font-semibold ml-1.5 mb-3">System Architecture</h3>
          <div className="DiagramContainer flex justify-center" ref={containerRef} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-7 md:gap-y-12 gap-x-7 md:grid-cols-1">

        <div>

          <h3 className="text-xl font-semibold ml-1.5 mb-3">
            Tech Stack
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Card className="transition-all duration-250 ease-in-out hover:-translate-y-0.5 hover:scale-102 hover:shadow-gray-400 hover:border-accent cursor-pointer overflow-x-auto scroller">
              <CardContent className="space-y-4 px-5 sm:px-6 max-w-[220px]">
                <h3 className="font-semibold mb-2 text-[16px]">Frontend</h3>
                <div className="flex gap-2 flex-wrap">
                  {Object.values(data?.tech_stack?.frontend || {}).map((value, i) => (
                    <Badge key={i} className="text-[11px]">{value}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-250 ease-in-out hover:-translate-y-0.5 hover:scale-102 hover:shadow-gray-400 hover:border-accent cursor-pointer overflow-x-auto scroller">
              <CardContent className="space-y-4 px-5 sm:px-6 max-w-[220px]">
                <h3 className="font-semibold mb-2 text-[16px]">Backend</h3>
                <div className="flex gap-2 flex-wrap">
                  {Object.values(data?.tech_stack?.backend || {}).map((item, i) => (
                    <Badge key={i} className="text-[11px]">{item}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-250 ease-in-out hover:-translate-y-0.5 hover:scale-102 hover:shadow-gray-400 hover:border-accent cursor-pointer overflow-x-auto scroller">
              <CardContent className="space-y-4 px-5 sm:px-6">
                <h3 className="font-semibold mb-2 text-[16px]">Database</h3>
                <Badge className="text-[11px]">
                  {data?.tech_stack?.database?.type}
                </Badge>
                <p className="text-xs text-muted-foreground" style={{ marginTop: "0.3rem" }}>
                  {data?.tech_stack?.database?.reason}
                </p>
              </CardContent>
            </Card>
          </div>

        </div>

        <div>

          <h3 className="text-xl font-semibold mt-6 md:mt-0 ml-1.5 mb-3">
            API Routes
          </h3>
          <Card className="pb-0">
            <CardContent className="scroller sm:px-6 px-[14px]">
              <Table className="overflow-x-auto scroller">
                <TableCaption className="text-[11px] text-left pl-2 pb-[5px]">*These are main API routes which will create the app. You can create your custom Routes</TableCaption>
                <TableHeader>
                  <TableRow className="text-[14px]">
                    <TableHead className="w-25">Method</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.api_routes?.map?.((route, i) => (
                    <TableRow key={i} className="border-t text-[13px]">
                      <TableCell className="font-medium min-w-[150px]">{route.method}</TableCell>
                      <TableCell className="min-w-[200px]">{route.path}</TableCell>
                      <TableCell>{route.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>

          <h3 className="text-xl font-semibold mt-6 md:mt-0 ml-1.5 mb-3">
            Folder Structure
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="pb-0">
              <CardContent className="overflow-x-auto scroller h-full sm:px-6 px-5">
                {data.folder_structure.frontend && (<p className="font-bold text-[18px]">Frontend: </p>)}
                <ul className="font-mono text-[13px] space-y-1 pl-px">
                  {data?.folder_structure?.frontend?.map?.((f, i) => (
                    <li key={i}>{f}</li>
                  ))}

                </ul>
              </CardContent>
            </Card>
            <Card className="pb-0">
              <CardContent className="overflow-x-auto scroller h-full sm:px-6 px-5">
                {data.folder_structure.frontend && (<p className="font-bold text-[18px]">Backend: </p>)}
                <ul className="font-mono text-[13px] space-y-1 pl-px pb-[5px]">
                  {data?.folder_structure?.backend?.map?.((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>

          <h3 className="text-xl font-semibold mt-6 md:mt-0 ml-1.5 mb-3">
            Database Schema
          </h3>
          <Carousel className="w-full">
            <CarouselContent className="-ml-1">
              {Object.entries(data?.database_schema || {}).map(([model, fields]) => (
                <>

                  <CarouselItem key={model} className="basis-1/1 sm:basis-1/2 md:basis-1/3 pl-1">
                    <div className="p-1 h-full">
                      <Card className="pb-0 h-full">
                        <CardContent className="overflow-x-auto scroller sm:px-6 px-5">
                          <div key={model} className="mb-4">
                            <h3 className="font-semibold">{model}</h3>
                            <RenderFields fields={fields} />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>

                </>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-2">
              <CarouselPrevious className="-left-3 cursor-pointer" />
              <CarouselNext className="-right-3 cursor-pointer" />
            </div>
          </Carousel>
        </div>

        <div>
          {data.project_estimation && (
            <>

            <h3 className="text-xl font-semibold mt-6 md:mt-0 ml-1.5 mb-3">
              Budget & Effort
            </h3>
            <div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 gap-y-6 ml-1.5 mb-3">
                <div className='bg-secondary rounded-xl p-4'>
                  <span className="flex gap-1.5 items-center text-muted-foreground">
                    <Clock4 className="size-3.5" />
                    <h3 className='text-[14px] font-semibold'>
                      Estimated time
                    </h3>
                  </span>
                  <span className='text-[1.6rem] font-semibold'>
                      {data.project_estimation.estimated_time}
                  </span>
                </div>
                <div className='bg-secondary rounded-xl p-4'>
                  <span className="flex gap-1.5 items-center text-muted-foreground">
                    <DollarSign className="size-3.5" />
                  <h3 className='text-[14px] font-semibold'>Estimated Cost</h3>
                  </span>
                  <span className='text-[1.6rem] font-semibold'>
                    {data.project_estimation.estimated_cost}
                  </span>
                </div>
              </div>

              <hr className='ml-1.5 my-4' />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 gap-y-6 ml-4 mb-3">

                <div>
                  <span className='flex gap-1.5 items-center mb-2 text-muted-foreground'>
                    <UsersRound className='size-3.5' />
                    <h3 className="text-[14px] font-semibold">Estimated team</h3>
                  </span>
                  <span >
                    <ul className="list-disc pl-4">
                      {data.project_estimation.estimated_team.map((li, idx) => (
                        <li className="text-[14px]" key={idx}>{li}</li>
                      ))}
                    </ul>
                  </span>
                </div>
                <div>
                  <span className='flex gap-1.5 items-center mb-2 text-muted-foreground'>
                    <FileText className='size-3.5' />
                    <h3 className="text-[14px] font-semibold">Cost Basis</h3>
                  </span>
                  <span className="text-[14px]">
                    {data.project_estimation.cost_basis}
                  </span>
                </div>
              </div>

            </div>

            <h3 className="text-xl font-semibold mt-14 ml-1.5 mb-5">
              Scorecard
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 gap-y-6 md:grid-cols-3 ml-4'>
              <div className="">
                <h3 className='mb-1.5 text-[14px] font-semibold text-muted-foreground'>Complexity</h3>
                <Rating value={data.project_estimation.complexity} />
              </div>
              <div className="">
                <h3 className='mb-1.5 text-[14px] font-semibold text-muted-foreground'>Performance</h3>
                <Rating value={data.project_estimation.performance} />
              </div>
              <div className="">
                <h3 className='mb-1.5 text-[14px] font-semibold text-muted-foreground'>Maintainability</h3>
                <Rating value={data.project_estimation.maintainability} />
              </div>
              <div className="">
                <h3 className='mb-1.5 text-[14px] font-semibold text-muted-foreground'>Security</h3>
                <Rating value={data.project_estimation.security} />
              </div>
              <div className="">
                <h3 className='mb-1.5 text-[14px] font-semibold text-muted-foreground'>Scalability</h3>
                <Rating value={data.project_estimation.scalability} />
              </div>


            </div>

            

            </>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold mt-6 md:mt-0 ml-1.5 mb-3">
            Feature Roadmap
          </h3>

          <div className="relative h-auto md:pt-0 pt-4">
            <div className="absolute left-4 md:left-1/2 top-0 h-full w-0.5 bg-muted-foreground"></div>

            {(data?.feature_roadmap || []).map((f, i) => (
              <div key={i} className="mb-12 flex md:items-center relative">


                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-muted-foreground bg-background"></div>

                {i % 2 === 0 ? (
                  <div className="w-full pl-10 md:pl-0 md:w-1/2 md:pr-8 text-left min-h-fit md:text-right md:min-h-[130px] md:pt-[50px] md:mt-0 mt-[-8px]">
                    <Badge className="px-3 py-0.75 font-medium mb-1 listBadge">
                      {f.name}
                    </Badge>
                    <p className="h-fit w-fit md:w-full md:h-full p-2 rounded-md text-sm text-muted-foreground font-medium bg-secondary leading-tight">
                      {f.description}
                    </p>
                  </div>
                ) : (
                  <div className="w-full pl-10 md:pl-8 md:w-1/2 text-left md:absolute md:right-0 md:min-h-[130px] md:pt-[50px] md:mt-0 mt-[-8px]">
                    <Badge className="px-3 py-0.75 font-medium mb-1 listBadge">
                      {f.name}
                    </Badge>
                    <p className="h-fit w-fit p-2 md:w-full md:h-full rounded-md text-sm text-muted-foreground font-medium bg-secondary leading-tight">
                      {f.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>


      </div >
    </>
  )
}