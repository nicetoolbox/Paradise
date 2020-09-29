import { useBackend } from "../../backend";
import { Button } from "../../components";
import { RndNavButton, RndRoute } from "./index";

export const DataDiskMenu = (properties, context) => {
  const { data, act } = useBackend(context);

  const { disk_data, disk_type, to_copy } = data;
  const {
    name, level, desc, lathe_types, materials,
  } = disk_data;

  if (!disk_type) {
    return null; // todo what path is this?
  }

  const TechSummary = () => (
    <div>
      <div>Name: {name}</div>
      <div>Level: {level}</div>
      <div>Description: {desc}</div>
      <Button content="Upload to Database" icon="arrow-up" onClick={() => act('updt_tech')} />
      <Button content="Clear Disk" icon="trash" onClick={() => act('clear_tech')} />
    </div>
  );

  const LatheSummary = () => (
    <div>
      <div>Name: {name}</div>
      {lathe_types ? (
        <div>
          Lathe Types:
          {lathe_types.join(', ')}
        </div>
      ) : null}

      <div>Required Materials:</div>

      {materials.map(mat => (
        <div key={mat.name}>{mat.name} x {mat.amount}</div>
      ))}

      <Button
        content="Upload to Database"
        icon="arrow-up"
        onClick={() => act('updt_design')} />

      <Button
        content="Clear Disk"
        icon="trash"
        onClick={() => act('clear_tech')} />

    </div>
  );

  const EmptyDisk = () => {
    return (
      <div>
        <div>This disk is empty.</div>
        <RndNavButton
          submenu={1}
          icon="fa fa-arrow-down"
          content={disk_type === 1
            ? 'Load Tech to Disk'
            : 'Load Design to Disk'}
        />
      </div>
    );
  };

  const ContentsSubmenu = () => (
    <div>
      <h3>Data Disk Contents:</h3>

      {disk_data
        ? (disk_type === 1 ? <TechSummary /> : <LatheSummary />)
        : <EmptyDisk />}

      <Button content="Eject Disk" icon="eject"
        onClick={() => {
          const action = disk_type === 1 ? 'eject_tech' : 'eject_design';
          act(action);
        }} />
    </div>
  );

  const CopySubmenu = () => (
    <div>
      {to_copy.map(({ name, id }) => (
        <div key={id}>
          <div>{name}</div>
          <Button
            icon="arrow-down"
            content="Copy to Disk"
            onClick={() => {
              if (disk_type === 1) {
                act('copy_tech', { id });
              } else {
                act('copy_design', { id });
              }
            }} />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <RndRoute submenu={0} render={() => <ContentsSubmenu />} />
      <RndRoute submenu={1} render={() => <CopySubmenu />} />
    </>
  );
};
