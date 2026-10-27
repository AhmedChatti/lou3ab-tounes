import json, csv, math
R='/home/claude/map-tunisia/dist/'
LON0, LATMAX, K = 7.5, 37.6, 100.0
C = math.cos(math.radians(34.0))
def P(lon,lat): return (round((lon-LON0)*C*K,1), round((LATMAX-lat)*K,1))
def rings(geom):
    t=geom['type']; c=geom['coordinates']
    polys = [c] if t=='Polygon' else c
    return polys
def path(geom):
    out=[]
    for poly in rings(geom):
        for ring in poly:
            pts=[P(*p[:2]) for p in ring]
            ded=[pts[0]]
            for p in pts[1:]:
                if p!=ded[-1]: ded.append(p)
            if len(ded)<3: continue
            out.append('M'+'L'.join(f'{x:g},{y:g}' for x,y in ded)+'Z')
    return ''.join(out)
def bbox(geom):
    xs=[];ys=[]
    for poly in rings(geom):
        for p in poly[0]:
            x,y=P(*p[:2]); xs.append(x); ys.append(y)
    return [min(xs),min(ys),max(xs),max(ys)]
def vkeys(geom):
    s=set()
    for poly in rings(geom):
        for ring in poly:
            for p in ring: s.add((round(p[0],5),round(p[1],5)))
    return s
def neighbors(feats):
    keys={f['properties']['id']:vkeys(f['geometry']) for f in feats}
    nb={k:[] for k in keys}
    ids=list(keys)
    for i,a in enumerate(ids):
        for b in ids[i+1:]:
            if len(keys[a]&keys[b])>=2: nb[a].append(b); nb[b].append(a)
    return nb
def rows(f): return {r['id']:r for r in csv.DictReader(open(R+'data/'+f))}

gj=json.load(open(R+'geojson/tunisia-governorates-medium.geojson'))
gr=rows('governorates.csv')
gnb=neighbors(gj['features'])
govs=[]
for f in gj['features']:
    i=f['properties']['id']; r=gr[i]
    lx,ly=P(float(r['label_lon']),float(r['label_lat']))
    govs.append(dict(id=i,en=r['name_en'],fr=r['name_fr'],ar=r['name_ar'],cap=r['capital_fr'],capAr=r['capital_ar'],
        region=r['region'],district=r['district'],p14=int(r['population_2014']),p24=int(r['population_2024']),
        area=float(r['area_km2']),lon=float(r['label_lon']),lat=float(r['label_lat']),lx=lx,ly=ly,
        nb=sorted(gnb[i]),d=path(f['geometry']),bb=bbox(f['geometry'])))
dj=json.load(open(R+'geojson/tunisia-delegations-low.geojson'))
dr=rows('delegations.csv')
dnb=neighbors(dj['features'])
dels=[]
for f in dj['features']:
    i=f['properties']['id']; r=dr[i]
    lx,ly=P(float(r['label_lon']),float(r['label_lat']))
    dels.append(dict(id=i,g=r['governorate'],en=r['name_en'],fr=r['name_fr'],ar=r['name_ar'],
        p24=int(r['population_2024'] or 0),p14=int(r['population_2014'] or 0),area=float(r['area_km2']),
        lon=float(r['label_lon']),lat=float(r['label_lat']),lx=lx,ly=ly,nb=sorted(dnb[i]),d=path(f['geometry'])))
cj=json.load(open(R+'geojson/tunisia-country-medium.geojson'))
country=path(cj['features'][0]['geometry']); cbb=bbox(cj['features'][0]['geometry'])
regions=[dict(id=r['id'],en=r['name_en'],fr=r['name_fr'],ar=r['name_ar'],govs=r['governorates'].split()) for r in csv.DictReader(open(R+'data/regions.csv'))]
out=dict(govs=govs,dels=dels,country=country,bb=cbb,regions=regions,proj=dict(lon0=LON0,latmax=LATMAX,k=K,c=C))
s='window.TN='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';'
open('/home/claude/lou3ab/assets/data.js','w').write(s)
print(len(s), cbb)
for g in govs: print(g['en'], [x for x in g['nb']])
print(sum(1 for d in dels if not d['nb']), 'isolated dels', sum(1 for d in dels if d['p24']==0),'zero pop')
